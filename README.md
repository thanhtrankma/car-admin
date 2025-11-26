# Car Dealership Admin - Hệ thống quản lý bán hàng cửa hàng ô tô

Hệ thống quản lý admin cho cửa hàng bán ô tô với các tính năng quản lý xe, đơn hàng, khách hàng và báo cáo.

## Tính năng

- 🔐 **Đăng nhập**: Xác thực người dùng
- 📊 **Tổng quan**: Dashboard với thống kê tổng quan
- 🚗 **Quản lý xe**: Quản lý danh sách xe, thêm, sửa, xóa
- 🛒 **Quản lý đơn hàng**: Theo dõi và quản lý đơn hàng
- 👥 **Quản lý khách hàng**: Quản lý thông tin khách hàng
- 📈 **Báo cáo**: Thống kê doanh thu và báo cáo bán hàng

## Công nghệ sử dụng

- React 19
- TypeScript
- React Router DOM
- Tailwind CSS
- Vite
- Lucide React (Icons)

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Cấu trúc thư mục

```
src/
  ├── components/
  │   └── Layout.tsx          # Layout chính với sidebar
  ├── pages/
  │   ├── Login.tsx           # Màn hình đăng nhập
  │   ├── Dashboard.tsx       # Màn hình tổng quan
  │   ├── CarManagement.tsx   # Quản lý xe
  │   ├── OrderManagement.tsx # Quản lý đơn hàng
  │   ├── CustomerManagement.tsx # Quản lý khách hàng
  │   └── Reports.tsx         # Báo cáo
  ├── App.tsx                 # Component chính với routing
  └── main.tsx                # Entry point
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```
