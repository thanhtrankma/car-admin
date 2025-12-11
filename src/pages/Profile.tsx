import { useEffect, useState } from 'react'
import { Card, Avatar, Descriptions, Tag, Spin, message, Button } from 'antd'
import { getProfile, type AuthUser } from '../services/authService'

const Profile = () => {
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await getProfile()
      setProfile(data)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể tải thông tin cá nhân'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const renderAvatar = () => {
    if (profile?.fullName) {
      const initials = profile.fullName
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
      return initials || profile.fullName.charAt(0).toUpperCase()
    }
    if (profile?.username) {
      return profile.username.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <Spin spinning={loading}>
      <Card
        title="Thông tin cá nhân"
        extra={
          <Button type="link" onClick={fetchProfile}>
            Làm mới
          </Button>
        }
      >
        {profile && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
              <Avatar size={96} style={{ backgroundColor: '#1890ff', fontSize: 32 }}>
                {renderAvatar()}
              </Avatar>
              <div>
                <h2 style={{ marginBottom: 4 }}>{profile.fullName || profile.username}</h2>
                <p style={{ marginBottom: 0, color: '#666' }}>{profile.email}</p>
                <Tag color={profile.status === 'ACTIVE' ? 'green' : 'red'} style={{ marginTop: 8 }}>
                  {profile.status}
                </Tag>
              </div>
            </div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên đăng nhập">{profile.username}</Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {profile.fullName || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">{profile.role}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={profile.status === 'ACTIVE' ? 'green' : 'red'}>{profile.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {profile.created_at ? new Date(profile.created_at).toLocaleString('vi-VN') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {profile.updated_at ? new Date(profile.updated_at).toLocaleString('vi-VN') : '—'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    </Spin>
  )
}

export default Profile
