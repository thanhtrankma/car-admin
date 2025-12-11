import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Select, Table, Space, Modal, Form, message, Divider, Row, Col, Typography, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { listProducts, type ProductDto } from '../services/productService';
import { listInvoices, createInvoice, getInvoiceById, type InvoiceDto, type InvoiceDetailResponse } from '../services/invoiceService';
import * as XLSX from 'xlsx-js-style';

const { Option } = Select;

interface OrderItem {
  productId: string;
  carCode: string;
  carName: string;
  sku?: string;
  version?: string;
  color?: string;
  cc?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderFormValues {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  productId?: string;
  quantity?: number;
}

const OrderManagement = () => {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetailResponse | null>(null);
  const { Title, Text } = Typography;

  const fetchProducts = useCallback(async () => {
    setProductLoading(true);
    try {
      const response = await listProducts({
        page: 1,
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setProducts(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách sản phẩm';
      message.error(errorMessage);
    } finally {
      setProductLoading(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setInvoiceLoading(true);
    try {
      const response = await listInvoices({
        page,
        limit,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setInvoices(response.data);
      setTotalInvoices(response.pagination.total);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách hóa đơn';
      message.error(errorMessage);
    } finally {
      setInvoiceLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addItem = (values: Pick<OrderFormValues, 'productId'>) => {
    const product = products.find((c) => c.id === values.productId);
    if (!product) {
      message.warning('Không tìm thấy sản phẩm');
      return;
    }
    const quantity = 1;

    const existingItem = orderItems.find(item => item.productId === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
          : item
      ));
      message.success(`Đã cập nhật ${product.name}: ${existingItem.quantity} → ${newQuantity}`);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          carCode: product.code,
          carName: product.name,
          sku: product.sku,
          version: product.version,
          color: product.color,
          cc: product.cc,
          quantity,
          unitPrice: product.price,
          total: quantity * product.price,
        },
      ]);
      message.success(`Đã thêm ${product.name} (x${quantity}) vào hóa đơn`);
    }
    form.setFieldsValue({ productId: undefined });
  };

  const isWithinTimeFilter = useCallback((dateString: string) => {
    if (timeFilter === 'all') return true;
    const targetDate = new Date(dateString);
    const now = new Date();

    if (timeFilter === 'day') {
      return targetDate.toDateString() === now.toDateString();
    }

    if (timeFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      return targetDate >= startOfWeek && targetDate < endOfWeek;
    }

    return (
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getFullYear() === now.getFullYear()
    );
  }, [timeFilter]);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const keyword = searchValue.trim().toLowerCase();
        const matchesSearch = keyword
          ? invoice.invoiceNumber?.toLowerCase().includes(keyword) ||
            invoice.customerName?.toLowerCase().includes(keyword)
          : true;

        return matchesSearch && isWithinTimeFilter(invoice.created_at);
      }),
    [invoices, searchValue, isWithinTimeFilter]
  );

  const removeItem = (carCode: string) => {
    setOrderItems(orderItems.filter(item => item.carCode !== carCode));
  };


  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  const handleSave = (values: OrderFormValues) => {
    if (orderItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }
    setCreatingInvoice(true);
    const payload = {
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      customerAddress: values.customerAddress,
      items: orderItems.map((item) => ({
        productId: item.productId,
      })),
    };

    createInvoice(payload)
      .then(() => {
        message.success('Tạo hóa đơn thành công!');
        setIsModalOpen(false);
        setOrderItems([]);
        form.resetFields();
        fetchInvoices();
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Không thể tạo hóa đơn';
        message.error(errorMessage);
      })
      .finally(() => {
        setCreatingInvoice(false);
      });
  };

  const handleExport = async (invoice: InvoiceDto) => {
    try {
      const detail = await getInvoiceById(invoice.id);
      
      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      
      // Tạo dữ liệu cho hóa đơn theo đúng form mẫu
      const invoiceData: (string | number)[][] = [];
      
      // Dòng 1: Header với số hóa đơn
      invoiceData.push(['', '', 'HÓA ĐƠN BÁN HÀNG', '', '', 'Số hóa đơn:', ]);
      
      // Dòng 2: Liên số
      invoiceData.push(['', '', '', '', '', 'Liên số:', '']);
      
      // Dòng 3: Ngày bán
      const createdDate = new Date(detail.invoice.created_at);
      const day = createdDate.getDate().toString().padStart(2, '0');
      const month = (createdDate.getMonth() + 1).toString().padStart(2, '0');
      const year = createdDate.getFullYear();
      invoiceData.push(['', '', `Ngày bán: ${day}/${month}/${year}`, '', '', '', '']);
      
      // Dòng 4: Đơn vị bán hàng
      invoiceData.push(['Đơn vị bán hàng:', 'Cửa hàng Honda ủy nhiệm HEAD T&H 14006 (HEAD 14006)', '', '', '', '', '']);
      
      // Dòng 5: Địa chỉ
      invoiceData.push(['Địa chỉ:', 'K1 Thành Công, Ba Đình, Hà Nội', '', '', '', '', '']);
      
      // Dòng 6: Điện thoại
      invoiceData.push(['Điện thoại:', '024.3772.4427', '', '', '', '', '']);
      
      // Dòng 7: Họ tên khách hàng và Nhân viên lập hóa đơn
      invoiceData.push(['Họ tên khách hàng:', detail.invoice.customerName, '', 'Nhân viên lập hóa đơn:', '', '', '']);
      
      // Dòng 8: Số tài khoản và Ngày sinh
      invoiceData.push(['Số tài khoản:', '', '', 'Ngày sinh:', '', '', '']);
      
      // Dòng 9: Số điện thoại và Giới tính
      invoiceData.push(['Số điện thoại:', detail.invoice.customerPhone, '', 'Giới tính:', '', '', '']);
      
      // Dòng 10: Địa chỉ
      invoiceData.push(['Địa chỉ:', detail.invoice.customerAddress || '', '', '', '', '', '']);
      
      // Dòng 11: Phương thức thanh toán
      invoiceData.push(['Phương thức thanh toán:', '', '', '', '', '', '']);
      
      // Dòng 12: Dòng trống
      invoiceData.push(['', '', '', '', '', '', '']);
      
      // Dòng 13: Header bảng
      invoiceData.push(['STT', 'Mã hàng', 'Tên hàng', 'Đơn vị tính', 'Số lượng', 'Đơn giá', 'Thành tiền']);
      
      // Dòng 14-24: Dữ liệu sản phẩm (tối đa 11 sản phẩm)
      const maxRows = 11;
      for (let i = 0; i < maxRows; i++) {
        if (i < detail.details.length) {
          const item = detail.details[i];
          invoiceData.push([
            i + 1,
            item.productSku,
            item.productName,
            'Cái',
            item.quantity,
            item.productPrice,
            item.totalPrice
          ]);
        } else {
          invoiceData.push(['', '', '', '', '', '', '']);
        }
      }
      
      // Dòng 25: Cộng thành tiền
      invoiceData.push(['Cộng thành tiền:', '', '', '', '', '', detail.invoice.totalAmount]);
      
      // Dòng 26: Tổng số tiền
      invoiceData.push(['Tổng số tiền:', '', '', '', '', '', detail.invoice.totalAmount]);
      
      // Dòng 27: Tổng số tiền viết bằng chữ
      invoiceData.push(['Tổng số tiền viết bằng chữ:', convertNumberToWords(detail.invoice.totalAmount) + ' đồng', '', '', '', '', '']);
      
      // Dòng 28-29: Dòng trống
      invoiceData.push(['', '', '', '', '', '', '']);
      invoiceData.push(['', '', '', '', '', '', '']);
      
      // Dòng 30: Chữ ký
      invoiceData.push(['', '', 'Người mua hàng', '', '', 'Người bán hàng', '']);
      
      // Dòng 31: Ghi chú chữ ký
      invoiceData.push(['', '', '', '', '', '(Ký, ghi rõ họ tên)', '']);
      
      // Dòng 32-39: Dòng trống cho chữ ký
      for (let i = 0; i < 8; i++) {
        invoiceData.push(['', '', '', '', '', '', '']);
      }
      
      // Tạo worksheet
      const ws = XLSX.utils.aoa_to_sheet(invoiceData);
      
      // Định dạng cột
      ws['!cols'] = [
        { wch: 20 },  // Cột 1
        { wch: 35 },  // Cột 2
        { wch: 30 },  // Cột 3
        { wch: 15 },  // Cột 4
        { wch: 12 },  // Cột 5
        { wch: 15 },  // Cột 6
        { wch: 15 }   // Cột 7
      ];
      
      // Merge cells
      ws['!merges'] = [
        { s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }, // HÓA ĐƠN BÁN HÀNG
        { s: { r: 2, c: 2 }, e: { r: 2, c: 4 } }, // Ngày bán
        { s: { r: 26, c: 1 }, e: { r: 26, c: 6 } }, // Tổng số tiền viết bằng chữ
      ];
      
      // Merge cells cho các ô thông tin khách hàng và nhân viên để tạo ô nhập liệu dài hơn
      // Địa chỉ khách hàng (dòng 9)
      ws['!merges'].push({ s: { r: 9, c: 1 }, e: { r: 9, c: 2 } });
      // Phương thức thanh toán (dòng 10)
      ws['!merges'].push({ s: { r: 10, c: 1 }, e: { r: 10, c: 2 } });
      // Merge dòng tổng tiền: Cộng thành tiền (r=24) và Tổng số tiền (r=25) cột 0-5
      ws['!merges'].push({ s: { r: 24, c: 0 }, e: { r: 24, c: 5 } });
      ws['!merges'].push({ s: { r: 25, c: 0 }, e: { r: 25, c: 5 } });
      
      // Định nghĩa border style
      const borderStyle = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };
      
      // Hàm helper để thêm border cho cell
      const addBorder = (row: number, col: number) => {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }
        if (!ws[cellAddress].s) {
          ws[cellAddress].s = {};
        }
        ws[cellAddress].s.border = borderStyle;
      };
      
      // Hàm helper để set style cho cell
      const setCellStyle = (row: number, col: number, style: { bold?: boolean; fontSize?: number; alignment?: { horizontal?: string; vertical?: string } }) => {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }
        if (!ws[cellAddress].s) {
          ws[cellAddress].s = {};
        }
        if (!ws[cellAddress].s.font) ws[cellAddress].s.font = {};
        // Luôn set font Times New Roman
        ws[cellAddress].s.font.name = 'Times New Roman';
        if (style.bold !== undefined) {
          ws[cellAddress].s.font.bold = style.bold;
        }
        if (style.fontSize !== undefined) {
          ws[cellAddress].s.font.sz = style.fontSize;
        }
        if (style.alignment) {
          ws[cellAddress].s.alignment = style.alignment;
        }
      };
      
      // Thêm border đậm chỉ cho viền ngoài của block đơn vị bán hàng (4A đến 7G = dòng 3-6, cột 0-6)
      // Viền trên (dòng 3)
      for (let col = 0; col <= 6; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.top = { style: 'medium', color: { rgb: '000000' } };
      }
      // Không thêm viền dưới cho dòng 6 vì đó là ranh giới chung với block dưới
      // Viền trái (cột 0)
      for (let row = 3; row <= 6; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.left = { style: 'medium', color: { rgb: '000000' } };
      }
      // Viền phải (cột 6)
      for (let row = 3; row <= 6; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 6 });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.right = { style: 'medium', color: { rgb: '000000' } };
      }
      
      // Thêm border đậm chỉ cho viền ngoài của block thông tin khách hàng (7A đến 11G = dòng 6-10, cột 0-6)
      // Viền trên (dòng 6) - đã có từ block trên, chỉ cần đảm bảo có border
      for (let col = 0; col <= 6; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 6, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.top = { style: 'medium', color: { rgb: '000000' } };
      }
      // Viền dưới (dòng 10)
      for (let col = 0; col <= 6; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 10, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.bottom = { style: 'medium', color: { rgb: '000000' } };
      }
      // Viền trái (cột 0)
      for (let row = 6; row <= 10; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.left = { style: 'medium', color: { rgb: '000000' } };
      }
      // Viền phải (cột 6)
      for (let row = 6; row <= 10; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 6 });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.right = { style: 'medium', color: { rgb: '000000' } };
      }
      
      // Thêm border đậm cho khung ngoài toàn bộ hóa đơn (1A đến 41G = dòng 0-40, cột 0-6)
      // Viền trên (dòng 0)
      for (let col = 0; col <= 6; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.top = { style: 'medium', color: { rgb: '000000' } };
      }
      // Viền dưới (dòng 40)
      for (let col = 0; col <= 6; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 40, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.bottom = { style: 'medium', color: { rgb: '000000' } };
      }
      // Viền trái (cột 0)
      for (let row = 0; row <= 40; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.left = { style: 'medium', color: { rgb: '000000' } };
      }
      // Viền phải (cột 6)
      for (let row = 0; row <= 40; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 6 });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.right = { style: 'medium', color: { rgb: '000000' } };
      }

      // Bổ sung viền phải (cột 6) cho vùng nội dung từ dòng 13 đến 27 (r=12..26)
      for (let row = 12; row <= 26; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 6 });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.right = { style: 'medium', color: { rgb: '000000' } };
      }

      // Đảm bảo viền phải cho cột G ở khu vực bảng và tổng cộng (ghi đè nếu bị mất do merge/styling khác)
      const enforceRightBorderRows = [...Array(27 - 12 + 1).keys()].map(i => 12 + i); // 12..26
      enforceRightBorderRows.forEach((r) => {
        const addr = XLSX.utils.encode_cell({ r, c: 6 });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };
        if (!ws[addr].s) ws[addr].s = {};
        if (!ws[addr].s.border) ws[addr].s.border = {};
        ws[addr].s.border.right = { style: 'medium', color: { rgb: '000000' } };
      });

      // Bổ sung viền bottom cho dòng 39 (1-based) → r = 38
      for (let col = 0; col <= 6; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 38, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        ws[cellAddress].s.border.bottom = { style: 'medium', color: { rgb: '000000' } };
      }

      // Thêm border cho bảng sản phẩm (dòng 13-24, cột 0-6)
      // Chỉ thêm border top, bottom, left cho các cột 0-5
      // Cột 6 (G) sẽ có border right đậm riêng
      for (let row = 12; row <= 23; row++) {
        for (let col = 0; col <= 5; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
          if (!ws[cellAddress].s) ws[cellAddress].s = {};
          if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
          // Chỉ thêm top, bottom, left, không có right
          ws[cellAddress].s.border.top = { style: 'thin', color: { rgb: '000000' } };
          ws[cellAddress].s.border.bottom = { style: 'thin', color: { rgb: '000000' } };
          ws[cellAddress].s.border.left = { style: 'thin', color: { rgb: '000000' } };
        }
        // Cột 6 (G) - thêm tất cả border trừ right (right sẽ được set đậm sau)
        const cellAddressG = XLSX.utils.encode_cell({ r: row, c: 6 });
        if (!ws[cellAddressG]) ws[cellAddressG] = { v: '', t: 's' };
        if (!ws[cellAddressG].s) ws[cellAddressG].s = {};
        if (!ws[cellAddressG].s.border) ws[cellAddressG].s.border = {};
        ws[cellAddressG].s.border.top = { style: 'thin', color: { rgb: '000000' } };
        ws[cellAddressG].s.border.bottom = { style: 'thin', color: { rgb: '000000' } };
        ws[cellAddressG].s.border.left = { style: 'thin', color: { rgb: '000000' } };
      }
      
      // Định dạng header chính "HÓA ĐƠN BÁN HÀNG" (dòng 0, cột 2)
      setCellStyle(0, 2, { bold: true, fontSize: 18, alignment: { horizontal: 'center', vertical: 'center' } });
      
      // Định dạng "Số hóa đơn:" và "Liên số:" (in đậm)
      setCellStyle(0, 5, { bold: true });
      setCellStyle(1, 5, { bold: true });
      
      // Định dạng "Ngày bán:" (in đậm)
      setCellStyle(2, 2, { bold: true, alignment: { horizontal: 'center' } });
      
      // Định dạng các nhãn thông tin (in đậm)
      // Dòng 4-6: Thông tin đơn vị bán hàng
      setCellStyle(3, 0, { bold: true }); // "Đơn vị bán hàng:"
      setCellStyle(4, 0, { bold: true }); // "Địa chỉ:"
      setCellStyle(5, 0, { bold: true }); // "Điện thoại:"
      
      // Dòng 7-11: Thông tin khách hàng và nhân viên
      setCellStyle(6, 0, { bold: true }); // "Họ tên khách hàng:"
      setCellStyle(6, 3, { bold: true }); // "Nhân viên lập hóa đơn:"
      setCellStyle(7, 0, { bold: true }); // "Số tài khoản:"
      setCellStyle(7, 3, { bold: true }); // "Ngày sinh:"
      setCellStyle(8, 0, { bold: true }); // "Số điện thoại:"
      setCellStyle(8, 3, { bold: true }); // "Giới tính:"
      setCellStyle(9, 0, { bold: true }); // "Địa chỉ:"
      setCellStyle(10, 0, { bold: true }); // "Phương thức thanh toán:"
      
      // Thêm border cho dòng header bảng (dòng 13)
      for (let col = 0; col <= 6; col++) {
        addBorder(12, col);
        const cellAddress = XLSX.utils.encode_cell({ r: 12, c: col });
        if (ws[cellAddress]) {
          if (!ws[cellAddress].s) ws[cellAddress].s = {};
          ws[cellAddress].s.font = { name: 'Times New Roman', bold: true, sz: 11 };
          ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        }
      }
      
      // Thêm công thức "7=5x6" vào header "Thành tiềnsssss"
      const thanhTienHeader = XLSX.utils.encode_cell({ r: 12, c: 6 });
      if (ws[thanhTienHeader]) {
        ws[thanhTienHeader].v = 'Thành tiền';
        if (!ws[thanhTienHeader].s) ws[thanhTienHeader].s = {};
        ws[thanhTienHeader].s.font = { name: 'Times New Roman', bold: true, sz: 11 };
        ws[thanhTienHeader].s.alignment = { horizontal: 'center', vertical: 'center', wrapTesxt: true };
      }
      
      // Thêm border cho các dòng tổng tiền (dòng 25-27, cột 0-6)
      for (let row = 24; row <= 26; row++) {
        for (let col = 0; col <= 6; col++) {
          addBorder(row, col);
        }
      }
      
      // Định dạng các nhãn tổng tiền (in đậm)
      setCellStyle(24, 0, { bold: true }); // "Cộng thành tiền:"
      setCellStyle(25, 0, { bold: true, fontSize: 12 }); // "Tổng số tiền:"
      setCellStyle(26, 0, { bold: true }); // "Tổng số tiền viết bằng chữ:"
      
      // Định dạng số tiền tổng (in đậm, căn phải, format số)
      const congThanhTienAddress = XLSX.utils.encode_cell({ r: 24, c: 6 });
      if (ws[congThanhTienAddress]) {
        if (!ws[congThanhTienAddress].s) ws[congThanhTienAddress].s = {};
        if (!ws[congThanhTienAddress].s.font) ws[congThanhTienAddress].s.font = {};
        ws[congThanhTienAddress].s.font = { name: 'Times New Roman', bold: true };
        if (!ws[congThanhTienAddress].s.alignment) ws[congThanhTienAddress].s.alignment = {};
        ws[congThanhTienAddress].s.alignment.horizontal = 'right';
        ws[congThanhTienAddress].s.numFmt = '#,##0';
      }
      
      const tongSoTienAddress = XLSX.utils.encode_cell({ r: 25, c: 6 });
      if (ws[tongSoTienAddress]) {
        if (!ws[tongSoTienAddress].s) ws[tongSoTienAddress].s = {};
        if (!ws[tongSoTienAddress].s.font) ws[tongSoTienAddress].s.font = {};
        ws[tongSoTienAddress].s.font = { name: 'Times New Roman', bold: true, sz: 12 };
        if (!ws[tongSoTienAddress].s.alignment) ws[tongSoTienAddress].s.alignment = {};
        ws[tongSoTienAddress].s.alignment.horizontal = 'right';
        ws[tongSoTienAddress].s.numFmt = '#,##0';
      }
      
      // Định dạng phần "Tổng số tiền viết bằng chữ" - in đậm và căn giữa
      const totalWordsLabel = XLSX.utils.encode_cell({ r: 26, c: 0 });
      if (ws[totalWordsLabel]) {
        if (!ws[totalWordsLabel].s) ws[totalWordsLabel].s = {};
        if (!ws[totalWordsLabel].s.font) ws[totalWordsLabel].s.font = {};
        ws[totalWordsLabel].s.font = { name: 'Times New Roman', bold: true };
        ws[totalWordsLabel].s.alignment = { horizontal: 'center', vertical: 'center' };
      }
      const totalWordsAddress = XLSX.utils.encode_cell({ r: 26, c: 1 });
      if (ws[totalWordsAddress]) {
        if (!ws[totalWordsAddress].s) ws[totalWordsAddress].s = {};
        ws[totalWordsAddress].s.font = { name: 'Times New Roman', bold: true };
      }

      // Căn giữa nhãn "Cộng thành tiền" và "Tổng số tiền" sau khi merge cột 0-5
      const congThanhTienLabel = XLSX.utils.encode_cell({ r: 24, c: 0 });
      if (ws[congThanhTienLabel]) {
        if (!ws[congThanhTienLabel].s) ws[congThanhTienLabel].s = {};
        if (!ws[congThanhTienLabel].s.font) ws[congThanhTienLabel].s.font = {};
        ws[congThanhTienLabel].s.font = { ...ws[congThanhTienLabel].s.font, name: 'Times New Roman', bold: true };
        ws[congThanhTienLabel].s.alignment = { horizontal: 'center', vertical: 'center' };
      }

      const tongSoTienLabel = XLSX.utils.encode_cell({ r: 25, c: 0 });
      if (ws[tongSoTienLabel]) {
        if (!ws[tongSoTienLabel].s) ws[tongSoTienLabel].s = {};
        if (!ws[tongSoTienLabel].s.font) ws[tongSoTienLabel].s.font = {};
        ws[tongSoTienLabel].s.font = { ...ws[tongSoTienLabel].s.font, name: 'Times New Roman', bold: true, sz: 12 };
        ws[tongSoTienLabel].s.alignment = { horizontal: 'center', vertical: 'center' };
      }
      
      // Căn chỉnh cho các cột trong bảng sản phẩm và set font Times New Roman
      for (let row = 13; row <= 23; row++) {
        // STT - căn giữa
        const sttAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (ws[sttAddress]) {
          if (!ws[sttAddress].s) ws[sttAddress].s = {};
          if (!ws[sttAddress].s.font) ws[sttAddress].s.font = {};
          ws[sttAddress].s.font.name = 'Times New Roman';
          if (!ws[sttAddress].s.alignment) ws[sttAddress].s.alignment = {};
          ws[sttAddress].s.alignment.horizontal = 'center';
        }
        
        // Số lượng - căn giữa
        const qtyAddress = XLSX.utils.encode_cell({ r: row, c: 4 });
        if (ws[qtyAddress]) {
          if (!ws[qtyAddress].s) ws[qtyAddress].s = {};
          if (!ws[qtyAddress].s.font) ws[qtyAddress].s.font = {};
          ws[qtyAddress].s.font.name = 'Times New Roman';
          if (!ws[qtyAddress].s.alignment) ws[qtyAddress].s.alignment = {};
          ws[qtyAddress].s.alignment.horizontal = 'center';
        }
        
        // Đơn giá và Thành tiền - căn phải, format số
        [5, 6].forEach(col => {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            if (!ws[cellAddress].s.font) ws[cellAddress].s.font = {};
            ws[cellAddress].s.font.name = 'Times New Roman';
            if (!ws[cellAddress].s.alignment) ws[cellAddress].s.alignment = {};
            ws[cellAddress].s.alignment.horizontal = 'right';
            // Format số với dấu phẩy ngăn cách hàng nghìn
            ws[cellAddress].s.numFmt = '#,##0';
          }
        });
        
        // Các cột khác (Mã hàng, Tên hàng, Đơn vị tính) - set font Times New Roman
        [1, 2, 3].forEach(col => {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (ws[cellAddress]) {
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            if (!ws[cellAddress].s.font) ws[cellAddress].s.font = {};
            ws[cellAddress].s.font.name = 'Times New Roman';
          }
        });
      }
      
      // Định dạng phần chữ ký (in đậm)
      setCellStyle(29, 2, { bold: true, fontSize: 12, alignment: { horizontal: 'center' } }); // "Người mua hàng"
      setCellStyle(29, 5, { bold: true, fontSize: 12, alignment: { horizontal: 'center' } }); // "Người bán hàng"
      
      // Định dạng phần ghi chú chữ ký (không in đậm, chữ nhỏ hơn)
      const noteAddress = XLSX.utils.encode_cell({ r: 30, c: 5 });
      if (ws[noteAddress]) {
        if (!ws[noteAddress].s) ws[noteAddress].s = {};
        ws[noteAddress].s.font = { name: 'Times New Roman', sz: 10, italic: true };
        ws[noteAddress].s.alignment = { horizontal: 'center' };
      }
      
      // Set font Times New Roman cho tất cả các cells còn lại trong worksheet
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = 0; row <= range.e.r; row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (ws[cellAddress]) {
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            if (!ws[cellAddress].s.font) ws[cellAddress].s.font = {};
            if (!ws[cellAddress].s.font.name) {
              ws[cellAddress].s.font.name = 'Times New Roman';
            }
          }
        }
      }
      
      // Căn phải cho cột thành tiền trong dòng tổng (đã xử lý ở trên)
      
      // Đảm bảo border right đậm cho cột G từ dòng 13-27 (sau cùng để không bị ghi đè bởi addBorder)
      for (let row = 12; row <= 26; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 6 });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.border) ws[cellAddress].s.border = {};
        // Ghi đè border right thành medium, giữ nguyên các border khác
        ws[cellAddress].s.border.right = { style: 'medium', color: { rgb: '000000' } };
      }
      
      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Hóa đơn');
      
      // Xuất file
      XLSX.writeFile(wb, `HoaDon_${detail.invoice.invoiceNumber}.xlsx`);
      
      message.success('Xuất hóa đơn thành công!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể xuất hóa đơn';
      message.error(errorMessage);
    }
  };

  const convertNumberToWords = (num: number): string => {
    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    const hundreds = ['', 'một trăm', 'hai trăm', 'ba trăm', 'bốn trăm', 'năm trăm', 'sáu trăm', 'bảy trăm', 'tám trăm', 'chín trăm'];
    
    if (num === 0) return 'không';
    
    const numStr = Math.floor(num).toString();
    const parts = [];
    
    // Xử lý hàng triệu
    if (numStr.length > 6) {
      const millions = parseInt(numStr.slice(0, numStr.length - 6));
      if (millions > 0) {
        parts.push(convertNumberToWords(millions) + ' triệu');
      }
    }
    
    // Xử lý hàng nghìn
    if (numStr.length > 3) {
      const thousands = parseInt(numStr.slice(-6, -3) || '0');
      if (thousands > 0) {
        parts.push(convertNumberToWords(thousands) + ' nghìn');
      }
    }
    
    // Xử lý hàng trăm, chục, đơn vị
    const remainder = parseInt(numStr.slice(-3)) || 0;
    if (remainder > 0) {
      const h = Math.floor(remainder / 100);
      const t = Math.floor((remainder % 100) / 10);
      const o = remainder % 10;
      
      if (h > 0) parts.push(hundreds[h]);
      if (t > 0) {
        if (t === 1 && o > 0) {
          parts.push('mười ' + ones[o]);
        } else {
          parts.push(tens[t]);
          if (o > 0) parts.push(ones[o]);
        }
      } else if (o > 0) {
        parts.push(ones[o]);
      }
    }
    
    return parts.join(' ');
  };

  const handleViewDetail = async (invoice: InvoiceDto) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await getInvoiceById(invoice.id);
      setInvoiceDetail(detail);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải chi tiết hóa đơn';
      message.error(errorMessage);
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const invoiceSubtotal = useMemo(() => {
    if (!invoiceDetail?.details) return 0;
    return invoiceDetail.details.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [invoiceDetail]);

  const grandTotal = useMemo(() => {
    if (invoiceDetail?.invoice?.totalAmount) return invoiceDetail.invoice.totalAmount;
    return invoiceSubtotal;
  }, [invoiceDetail, invoiceSubtotal]);

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setInvoiceDetail(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const itemColumns: ColumnsType<OrderItem> = [
    {
      title: 'Thông tin sản phẩm',
      key: 'productInfo',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{record.carName}</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
            <strong>Mã:</strong> {record.carCode} {record.sku && `• SKU: ${record.sku}`}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {[record.version && `Phiên bản: ${record.version}`, record.color && `Màu: ${record.color}`, record.cc && `${record.cc}cc`]
              .filter(Boolean)
              .join(' • ')}
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (price) => formatPrice(price) + ' VNĐ',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      render: (total) => <strong>{formatPrice(total)} VNĐ</strong>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.carCode)}
        />
      ),
    },
  ];

  const invoiceColumns: ColumnsType<InvoiceDto> = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'SĐT',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      key: 'productCount',
      render: (count) => count ?? 0,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (total) => <strong>{formatPrice(total)} VNĐ</strong>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleExport(record)}
          >
            Xuất
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: window.innerWidth < 768 ? 'flex-start' : 'center', 
        marginBottom: 24,
        gap: window.innerWidth < 768 ? 16 : 0,
      }}>
        <div>
          <h1 style={{ fontSize: window.innerWidth < 576 ? 20 : 24, fontWeight: 'bold', marginBottom: 8 }}>Quản lý đơn hàng</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Tạo và quản lý hóa đơn bán hàng</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          block={window.innerWidth < 768}
        >
          Tạo hóa đơn mới
        </Button>
      </div>

      <Modal
        title="Tạo hóa đơn mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setOrderItems([]);
          form.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{}}
        >
          <Form.Item
            label="Tên khách hàng"
            name="customerName"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="Nhập tên khách hàng" size="large" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="customerPhone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" size="large" />
          </Form.Item>

          <Form.Item
            label="Email khách hàng"
            name="customerEmail"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email khách hàng" size="large" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ khách hàng"
            name="customerAddress"
          >
            <Input placeholder="Nhập địa chỉ khách hàng" size="large" />
          </Form.Item>

          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Thêm sản phẩm</span>
                {orderItems.length > 0 && (
                  <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>
                    Đã thêm: {orderItems.length} sản phẩm
                  </span>
                )}
              </div>
            } 
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={12} md={10}>
                <Form.Item
                  name="productId"
                  rules={[{ required: orderItems.length > 0 ? false : true, message: 'Vui lòng chọn xe' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    placeholder="Chọn xe"
                    size="large"
                    style={{ width: '100%' }}
                    loading={productLoading}
                    showSearch
                    optionFilterProp="label"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && form.getFieldValue('productId')) {
                        e.preventDefault();
                        form.validateFields(['productId']).then((values) => {
                          addItem(values);
                        }).catch(() => {});
                      }
                    }}
                  >
                    {products.map((product) => {
                      const infoParts = [];
                      if (product.version) infoParts.push(`Phiên bản: ${product.version}`);
                      if (product.color) infoParts.push(`Màu: ${product.color}`);
                      if (product.cc) infoParts.push(`${product.cc}cc`);
                      const infoText = infoParts.length > 0 ? infoParts.join(' • ') : '';
                      
                      return (
                        <Option 
                          key={product.id} 
                          value={product.id} 
                          label={`${product.name} ${product.code} ${product.version || ''} ${product.color || ''}`}
                        >
                          <div style={{ padding: '4px 0' }}>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                              <strong>Mã:</strong> {product.code} {product.sku && `• SKU: ${product.sku}`}
                            </div>
                            {infoText && (
                              <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>
                                {infoText}
                              </div>
                            )}
                            <div style={{ fontSize: 13, color: '#1890ff', fontWeight: 500, marginTop: 4 }}>
                              {formatPrice(product.price)} VNĐ
                              {product.quantity !== undefined && (
                                <span style={{ marginLeft: 8, color: product.quantity > 0 ? '#52c41a' : '#ff4d4f', fontSize: 11 }}>
                                  • Tồn kho: {product.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={4} md={4}>
                <Button 
                  type="primary" 
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.validateFields(['productId']).then((values) => {
                      addItem(values);
                      // Focus back to select after adding
                      setTimeout(() => {
                        const selectElement = document.querySelector('[name="productId"]') as HTMLElement;
                        if (selectElement) {
                          selectElement.focus();
                        }
                      }, 100);
                    }).catch(() => {
                      message.warning('Vui lòng chọn xe trước khi thêm');
                    });
                  }}
                >
                  Thêm
                </Button>
              </Col>
              <Col xs={24} sm={24} md={4}>
                <Button 
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    const productId = form.getFieldValue('productId');
                    if (!productId) {
                      message.warning('Vui lòng chọn xe trước');
                      return;
                    }
                    form.validateFields(['productId']).then((values) => {
                      addItem(values);
                      form.setFieldsValue({ productId: undefined });
                    }).catch(() => {});
                  }}
                >
                  Thêm nhanh (x1)
                </Button>
              </Col>
            </Row>
            <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
              💡 Mẹo: Nhấn Enter sau khi chọn xe để thêm nhanh
            </div>
          </Card>

          {orderItems.length > 0 && (
            <Card title="Danh sách sản phẩm" style={{ marginBottom: 16 }}>
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={itemColumns}
                  dataSource={orderItems}
                  rowKey="productId"
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                />
              </div>
            </Card>
          )}

          {orderItems.length > 0 && (
            <Card style={{ marginBottom: 16, background: '#e6f7ff' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d9d9d9', paddingTop: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold' }}>TỔNG CỘNG:</span>
                  <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                    {formatPrice(total)} VNĐ
                  </span>
                </div>
              </Space>
            </Card>
          )}

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setIsModalOpen(false);
                setOrderItems([]);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={creatingInvoice}>
                Lưu hóa đơn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Card style={{ marginBottom: 16 }}>
        <Space direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'} size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Nhập từ khóa tìm kiếm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="large"
          />
          <Select
            value={timeFilter}
            onChange={(value) => setTimeFilter(value)}
            style={{ minWidth: 180 }}
            size="large"
          >
            <Option value="all">Tất cả thời gian</Option>
            <Option value="day">Trong ngày</Option>
            <Option value="week">Trong tuần</Option>
            <Option value="month">Trong tháng</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={invoiceColumns}
            dataSource={filteredInvoices}
            rowKey="id"
            loading={invoiceLoading}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: 'Chưa có hóa đơn nào. Hãy tạo hóa đơn mới!',
            }}
            pagination={{
              current: page,
              pageSize: limit,
              total: totalInvoices,
              showSizeChanger: true,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setLimit(newPageSize || limit);
              },
              showTotal: (value) => `Tổng ${value} hóa đơn`,
            }}
          />
        </div>
      </Card>

      <Modal
        open={detailModalOpen}
        onCancel={handleCloseDetail}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 720}
        title="Chi tiết hóa đơn"
      >
        <Spin spinning={detailLoading}>
          {invoiceDetail ? (
            <div style={{ padding: window.innerWidth < 768 ? 8 : 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <Title level={4} style={{ marginBottom: 0 }}>
                    Honda Head T&H
                  </Title>
                  <Text>Số 10 Láng Hạ, Giảng Võ, Hà Nội 
                  </Text>
                  <br />
                  <Text>Hotline: 1900 1234</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text>Mã hóa đơn</Text>
                  <Title level={5} style={{ margin: 0 }}>
                    {invoiceDetail.invoice.invoiceNumber}
                  </Title>
                  <Text>
                    Ngày lập: {formatDate(invoiceDetail.invoice.created_at)}
                  </Text>
                </div>
              </div>

              <Divider dashed />

              <Row gutter={32} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                  <Title level={5}>Thông tin người mua</Title>
                  <Space direction="vertical" size={2}>
                    <Text strong>{invoiceDetail.invoice.customerName}</Text>
                    <Text>SĐT: {invoiceDetail.invoice.customerPhone}</Text>
                    {invoiceDetail.invoice.customerEmail && <Text>Email: {invoiceDetail.invoice.customerEmail}</Text>}
                    {invoiceDetail.invoice.customerAddress && <Text>Địa chỉ: {invoiceDetail.invoice.customerAddress}</Text>}
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Title level={5}>Thông tin thanh toán</Title>
                  <Space direction="vertical" size={2}>
                    <Text>Hình thức: Chuyển khoản/ Tiền mặt</Text>
                    <Text>Nhân viên: System</Text>
                    <Text>Trạng thái: Đã tạo</Text>
                  </Space>
                </Col>
              </Row>

              <Divider />

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: 16,
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'left' }}>#</th>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'left' }}>Sản phẩm</th>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'center' }}>Số lượng</th>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'right' }}>Đơn giá</th>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceDetail.details.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8' }}>{index + 1}</td>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8' }}>
                          <Text strong>{item.productName}</Text>
                          <br />
                          <Text type="secondary">SKU: {item.productSku}</Text>
                        </td>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'center' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'right' }}>
                          {formatPrice(item.productPrice)} VNĐ
                        </td>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'right' }}>
                          {formatPrice(item.totalPrice)} VNĐ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Row justify="end">
                <Col xs={24} md={12}>
                  <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 16 }}>TỔNG CỘNG:</Text>
                      <Text strong style={{ fontSize: 18, color: '#d4380d' }}>
                        {formatPrice(grandTotal)} VNĐ
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider dashed />

              <Row gutter={32}>
                <Col xs={24} md={12}>
                  <Text>Người lập hóa đơn</Text>
                  <div style={{ height: 60, border: '1px dashed #d9d9d9', marginTop: 8, borderRadius: 6 }} />
                </Col>
                <Col xs={24} md={12}>
                  <Text>Khách hàng</Text>
                  <div style={{ height: 60, border: '1px dashed #d9d9d9', marginTop: 8, borderRadius: 6 }} />
                </Col>
              </Row>
            </div>
          ) : (
            !detailLoading && <Text>Không có dữ liệu hóa đơn</Text>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default OrderManagement;
