import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Plus, Send, Archive, Trash2, Eye, ArrowLeft, Calendar, Clock, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

// Types
interface Campaign {
  _id: string
  title: string
  subject: string
  htmlContent: string
  status: 'draft' | 'scheduled' | 'sent'
  scheduledFor?: Date
  sentAt?: Date
  recipientCount: number
  createdBy?: any
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalSubscribers: number
  totalCampaigns: number
  sentCampaigns: number
}

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  background: #f8f9fa;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px;
    margin: 0;
    min-height: 100vh;
    background: #ffffff;
  }
`

const Header = styled.div`
  background: #1a1a1a;
  color: white;
  padding: 24px;
  margin: -40px -24px 32px -24px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  h1 {
    font-size: 28px;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    margin: -40px -16px 12px -16px;
    width: calc(100% + 32px);
    padding: 16px;
    gap: 12px;
    border-radius: 0;
    margin-top: 12px;
    
    h1 {
      font-size: 22px;
      width: 100%;
      order: 1;
      text-align: center;
    }
    
    > div:last-child {
      width: 100%;
      order: 2;
    }
  }
`

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    gap: 8px;
  }
`

const Button = styled.button`
  background: #C9A876;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    border-radius: 8px;
  }
`

const SecondaryBtn = styled(Button)`
  background: #667eea;
  padding: 10px 16px;

  &:hover {
    background: #5568d3;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-top: 4px solid #C9A876;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  h3 {
    color: #888;
    font-size: 12px;
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  p {
    font-size: 24px;
    font-weight: 700;
    color: #C9A876;
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 12px;
    h3 {
      font-size: 10px;
      margin-bottom: 6px;
    }
    p {
      font-size: 18px;
    }
  }
`

const TabContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`

const TabNav = styled.div`
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  background: #f8f9fa;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`

const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 16px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: ${props => props.$active ? '#C9A876' : '#666'};
  border-bottom: 3px solid ${props => props.$active ? '#C9A876' : 'transparent'};
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    color: #C9A876;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 12px;
  }
`

const TabContent = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`

const CampaignsList = styled.div`
  display: grid;
  gap: 16px;
`

const CampaignCard = styled.div<{ $status: 'draft' | 'scheduled' | 'sent' }>`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border-left: 4px solid ${props => {
    switch(props.$status) {
      case 'sent': return '#4caf50'
      case 'scheduled': return '#2196f3'
      case 'draft': return '#999'
      default: return '#999'
    }
  }};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const CampaignInfo = styled.div`
  flex: 1;

  h4 {
    margin: 0 0 4px;
    font-size: 16px;
    color: #333;
  }

  p {
    margin: 4px 0;
    font-size: 13px;
    color: #666;
  }
`

const StatusBadge = styled.span<{ $status: 'draft' | 'scheduled' | 'sent' }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.$status) {
      case 'sent': return '#e8f5e9'
      case 'scheduled': return '#e3f2fd'
      case 'draft': return '#f5f5f5'
      default: return '#f5f5f5'
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'sent': return '#2e7d32'
      case 'scheduled': return '#1565c0'
      case 'draft': return '#666'
      default: return '#666'
    }
  }};
`

const CampaignActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #666;
  transition: all 0.2s ease;
  border-radius: 6px;

  &:hover {
    background: #f0f0f0;
    color: #C9A876;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Editor = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  input, textarea, select {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #C9A876;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 200px;
    font-family: 'Monaco', 'Courier New', monospace;
  }

  small {
    color: #666;
    font-size: 12px;
  }
`

const PreviewFrame = styled.iframe`
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  height: 400px;
`

const TemplateButtonsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const TemplateBtn = styled.button`
  padding: 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-size: 13px;

  &:hover {
    border-color: #C9A876;
    background: #fffbf0;
  }

  strong {
    display: block;
    margin-bottom: 4px;
    color: #333;
  }

  small {
    color: #666;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;

  p {
    margin: 12px 0;
  }
`

const AdminNewsletter: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'campaigns' | 'compose'>('campaigns')
  const [stats, setStats] = useState<Stats>({ totalSubscribers: 0, totalCampaigns: 0, sentCampaigns: 0 })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    htmlContent: '',
    scheduledFor: '',
    status: 'draft'
  })

  const [editingId, setEditingId] = useState<string | null>(null)

  // Check auth
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin only.')
      window.location.href = '/'
    }
  }, [user])

  // Fetch stats and campaigns
  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, campaignsRes] = await Promise.all([
          api.get('/newsletter/admin/stats'),
          api.get('/newsletter/admin/campaigns')
        ])

        setStats(statsRes.data?.data || {})
        setCampaigns(campaignsRes.data?.data || [])
      } catch (err) {
        console.error('Failed to fetch newsletter data:', err)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  // Update preview
  useEffect(() => {
    if (iframeRef.current && formData.htmlContent) {
      iframeRef.current.srcdoc = formData.htmlContent
    }
  }, [formData.htmlContent])

  const templates = {
    promotionalEmail: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: #C9A876; color: white; padding: 30px; text-align: center;">
    <img src="/EricaLogoWhite.png" alt="Erica Spanks" style="max-height: 20px; margin-bottom: 15px;">
    <h1 style="margin: 0; font-size: 32px;">Special Offer!</h1>
  </div>
  
  <div style="padding: 30px; border: 1px solid #eee;">
    <h2>Exclusive Promotion</h2>
    <p>We have something special for you!</p>
    
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <p style="font-size: 24px; color: #C9A876; margin: 10px 0;"><strong>20% OFF</strong></p>
      <p style="margin: 10px 0;">Use code: <strong>SPECIAL20</strong></p>
    </div>
    
    <p>Limited time offer. Don't miss out!</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="#" style="background: #C9A876; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Shop Now</a>
    </div>
    
    <p style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
      © 2026 Erica Spanks. All rights reserved.
    </p>
  </div>
</div>`,

    newCollectionEmail: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: #C9A876; color: white; padding: 30px; text-align: center;">
    <img src="/EricaLogoWhite.png" alt="Erica Spanks" style="max-height: 20px; margin-bottom: 15px;">
    <h1 style="margin: 0; font-size: 28px;"> New Collection Alert </h1>
  </div>
  
  <div style="padding: 30px; border: 1px solid #eee;">
    <h2>Introducing Our Latest Collection</h2>
    <p>We're thrilled to unveil our brand new collection, crafted with elegance and style in mind.</p>
    
    <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
      Be among the first to explore the newest designs. Our collection features premium fabrics and exclusive styles that you won't find anywhere else.
    </p>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="#" style="background: #C9A876; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Explore Collection</a>
    </div>
    
    <p style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
      © 2026 Erica Spanks. All rights reserved.
    </p>
  </div>
</div>`,

    eventAnnouncement: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: #C9A876; color: white; padding: 30px; text-align: center;">
    <img src="/EricaLogoWhite.png" alt="Erica Spanks" style="max-height: 20px; margin-bottom: 15px;">
    <h1 style="margin: 0; font-size: 28px;">Exciting Event Coming!</h1>
  </div>
  
  <div style="padding: 30px; border: 1px solid #eee;">
    <h2>Join Us for an Exclusive Event</h2>
    
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Date:</strong> Coming Soon</p>
      <p><strong>Event:</strong> Special Launch Party</p>
      <p><strong>Benefit:</strong> Exclusive previews & special discounts</p>
    </div>
    
    <p>We're hosting a special event for our valued customers. Stay tuned for more details!</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="#" style="background: #C9A876; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Learn More</a>
    </div>
    
    <p style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
      © 2026 Erica Spanks. All rights reserved.
    </p>
  </div>
</div>`
  }

  const applyTemplate = (template: string) => {
    setFormData(prev => ({
      ...prev,
      htmlContent: template
    }))
    toast.success('Template applied!')
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      htmlContent: '',
      scheduledFor: '',
      status: 'draft'
    })
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.subject || !formData.htmlContent) {
      toast.error('Title, subject, and content are required')
      return
    }

    try {
      if (editingId) {
        await api.put(`/newsletter/admin/campaigns/${editingId}`, {
          ...formData,
          status: formData.status || 'draft'
        })
        toast.success('Campaign updated')
      } else {
        await api.post('/newsletter/admin/campaigns', {
          ...formData,
          status: formData.status || 'draft'
        })
        toast.success('Campaign saved as draft')
      }

      const res = await api.get('/newsletter/admin/campaigns')
      setCampaigns(res.data?.data || [])
      resetForm()
      setActiveTab('campaigns')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save campaign')
    }
  }

  const handleSendOrSchedule = async (campaignId: string, sendNow: boolean, scheduledFor?: string) => {
    try {
      const payload: any = { sendNow }
      if (!sendNow && scheduledFor) {
        payload.scheduledFor = scheduledFor
      }

      const res = await api.post(`/newsletter/admin/campaigns/${campaignId}/send`, payload)
      toast.success(res.data?.message || 'Campaign processed')

      const updated = await api.get('/newsletter/admin/campaigns')
      setCampaigns(updated.data?.data || [])
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send campaign')
    }
  }

  const handleDelete = async (campaignId: string) => {
    if (window.confirm('Delete this campaign? This cannot be undone.')) {
      try {
        await api.delete(`/newsletter/admin/campaigns/${campaignId}`)
        toast.success('Campaign deleted')

        const res = await api.get('/newsletter/admin/campaigns')
        setCampaigns(res.data?.data || [])
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete campaign')
      }
    }
  }

  if (loading) {
    return <Container><p>Loading...</p></Container>
  }

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={24} /> Newsletter Manager
          </h1>
        </div>
        <Actions>
          <SecondaryBtn onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={18} />
            Back
          </SecondaryBtn>
        </Actions>
      </Header>

      <StatsSection>
        <StatCard>
          <h3>Total Subscribers</h3>
          <p>{stats.totalSubscribers.toLocaleString()}</p>
        </StatCard>
        <StatCard>
          <h3>Campaigns Created</h3>
          <p>{stats.totalCampaigns}</p>
        </StatCard>
        <StatCard>
          <h3>Campaigns Sent</h3>
          <p>{stats.sentCampaigns}</p>
        </StatCard>
      </StatsSection>

      <TabContainer>
        <TabNav>
          <TabButton
            $active={activeTab === 'campaigns'}
            onClick={() => setActiveTab('campaigns')}
          >
            All Campaigns
          </TabButton>
          <TabButton
            $active={activeTab === 'compose'}
            onClick={() => setActiveTab('compose')}
          >
            Compose New
          </TabButton>
        </TabNav>

        <TabContent>
          {activeTab === 'campaigns' && (
            <>
              {campaigns.length === 0 ? (
                <EmptyState>
                  <p>No campaigns yet. Start by creating your first newsletter!</p>
                  <Button onClick={() => setActiveTab('compose')} style={{ marginTop: '20px', width: '200px', margin: '20px auto' }}>
                    <Plus size={18} />
                    Create Campaign
                  </Button>
                </EmptyState>
              ) : (
                <CampaignsList>
                  {campaigns.map(campaign => (
                    <CampaignCard key={campaign._id} $status={campaign.status}>
                      <CampaignInfo>
                        <h4>{campaign.title}</h4>
                        <p><strong>Subject:</strong> {campaign.subject}</p>
                        <p><strong>Recipients:</strong> {campaign.recipientCount.toLocaleString()}</p>
                        {campaign.scheduledFor && (
                          <p><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Scheduled: {new Date(campaign.scheduledFor).toLocaleString()}</p>
                        )}
                        {campaign.sentAt && (
                          <p>Sent: {new Date(campaign.sentAt).toLocaleString()}</p>
                        )}
                        <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Created: {new Date(campaign.createdAt).toLocaleDateString()}</p>
                      </CampaignInfo>
                      <StatusBadge $status={campaign.status}>{campaign.status}</StatusBadge>
                      <CampaignActions>
                        <IconBtn title="Preview">
                          <Eye size={18} />
                        </IconBtn>
                        {campaign.status !== 'sent' && (
                          <>
                            <IconBtn 
                              onClick={() => {
                                setEditingId(campaign._id)
                                setFormData({
                                  title: campaign.title,
                                  subject: campaign.subject,
                                  htmlContent: campaign.htmlContent,
                                  scheduledFor: campaign.scheduledFor ? new Date(campaign.scheduledFor).toISOString().slice(0, 16) : '',
                                  status: campaign.status
                                })
                                setActiveTab('compose')
                              }}
                              title="Edit"
                            >
                              📝
                            </IconBtn>
                            <Button
                              onClick={() => handleSendOrSchedule(campaign._id, true)}
                              style={{ padding: '6px 12px', fontSize: '12px', background: '#4caf50' }}
                              title="Send Now"
                            >
                              <Send size={14} />
                              Send
                            </Button>
                            <IconBtn
                              onClick={() => handleDelete(campaign._id)}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </IconBtn>
                          </>
                        )}
                      </CampaignActions>
                    </CampaignCard>
                  ))}
                </CampaignsList>
              )}
            </>
          )}

          {activeTab === 'compose' && (
            <>
              <FormGroup>
                <label>Campaign Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Sale Campaign"
                />
              </FormGroup>

              <FormGroup>
                <label>Email Subject Line *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Exclusive 20% Off Summer Collection"
                />
                <small>This is what recipients will see in their inbox</small>
              </FormGroup>

              <FormGroup>
                <label>Quick Templates</label>
                <small>Click to apply a template and customize it</small>
                <TemplateButtonsSection>
                  <TemplateBtn onClick={() => applyTemplate(templates.promotionalEmail)}>
                    <strong> Promotional</strong>
                    <small>Special offers & discounts</small>
                  </TemplateBtn>
                  <TemplateBtn onClick={() => applyTemplate(templates.newCollectionEmail)}>
                    <strong> New Collection</strong>
                    <small>Announce new products</small>
                  </TemplateBtn>
                  <TemplateBtn onClick={() => applyTemplate(templates.eventAnnouncement)}>
                    <strong> Event</strong>
                    <small>Special announcements</small>
                  </TemplateBtn>
                </TemplateButtonsSection>
              </FormGroup>

              <Editor>
                <EditorSection>
                  <FormGroup>
                    <label>Email Content (HTML) *</label>
                    <small>Enter HTML content or use a template above. Professional formatting is built-in.</small>
                    <textarea
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                      placeholder="Enter your email content here..."
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Schedule Sending (Optional)</label>
                    <small>Leave empty to send immediately, or pick a date/time to schedule</small>
                    <input
                      type="datetime-local"
                      value={formData.scheduledFor}
                      onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    />
                  </FormGroup>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button onClick={handleSave}>
                      <Archive size={18} />
                      {editingId ? 'Update Draft' : 'Save as Draft'}
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingId) {
                          if (formData.scheduledFor) {
                            handleSendOrSchedule(editingId, false, formData.scheduledFor)
                          } else {
                            handleSendOrSchedule(editingId, true)
                          }
                        } else {
                          // First save the draft, then send/schedule
                          handleSave()
                          setTimeout(() => {
                            const campaign = campaigns[0]
                            if (campaign) {
                              if (formData.scheduledFor) {
                                handleSendOrSchedule(campaign._id, false, formData.scheduledFor)
                              } else {
                                handleSendOrSchedule(campaign._id, true)
                              }
                            }
                          }, 500)
                        }
                      }}
                      style={{ background: formData.scheduledFor ? '#2196f3' : '#4caf50' }}
                    >
                      {formData.scheduledFor ? (
                        <>
                          <Calendar size={18} />
                          Schedule Send
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Now
                        </>
                      )}
                    </Button>
                    <SecondaryBtn onClick={resetForm}>Clear</SecondaryBtn>
                  </div>
                </EditorSection>

                <EditorSection>
                  <label style={{ marginBottom: '8px', fontWeight: 600, color: '#333' }}>Email Preview</label>
                  <small style={{ marginBottom: '12px', color: '#666', display: 'block' }}>How your email will look to recipients:</small>
                  <PreviewFrame ref={iframeRef} title="Email Preview" />
                </EditorSection>
              </Editor>
            </>
          )}
        </TabContent>
      </TabContainer>
    </Container>
  )
}

export default AdminNewsletter
