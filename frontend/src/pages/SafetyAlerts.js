import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  FiPlus,
  FiSearch,
  FiAlertTriangle,
  FiShield,
  FiEye,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiAlertCircle
} from 'react-icons/fi';

const AlertsContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
  font-size: 1.125rem;
`;

const AlertsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const AlertCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 4px solid ${props => props.severityColor};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const AlertHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const AlertInfo = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AlertMessage = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
    color: #3b82f6;
    border-color: #3b82f6;
  }
  
  &.danger:hover {
    color: #ef4444;
    border-color: #ef4444;
  }
`;

const AlertFooter = styled.div`
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => props.color + '20'};
  color: ${props => props.color};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  width: min(720px, 92vw);
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.25);
  padding: 1.5rem;
`;

const ModalTitle = styled.h3`
  color: #1e293b;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
  min-height: 110px;
  resize: vertical;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

const SafetyAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    alertType: 'general',
    severity: 'warning',
    locationName: ''
  });
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    search: ''
  });

  const isPrivileged = user?.role === 'admin' || user?.role === 'safety_officer';

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => (
        prev.search === searchInput ? prev : { ...prev, search: searchInput }
      ));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/alerts?${params.toString()}`);
      const normalizedAlerts = (response.data.alerts || []).map((alert) => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        alertType: alert.alert_type,
        severity: alert.severity,
        locationName: alert.location_name,
        isActive: !!alert.is_active,
        expiresAt: alert.expires_at,
        createdAt: alert.created_at
      }));

      const incidentAlerts = (response.data.incidents || []).map((incident) => {
        const normalizedIncidentType = String(incident.incident_type || '').toLowerCase();
        const normalizedTitle = String(incident.title || '').toLowerCase();
        const mappedSeverity = incident.severity === 'critical' || incident.severity === 'high'
          ? 'danger'
          : incident.severity === 'medium'
            ? 'warning'
            : 'info';

        let mappedType = 'security';
        if (
          normalizedIncidentType === 'natural_disaster' ||
          normalizedTitle.includes('natural_disaster') ||
          normalizedTitle.includes('natural disaster') ||
          normalizedTitle.includes('storm') ||
          normalizedTitle.includes('flood') ||
          normalizedTitle.includes('cyclone')
        ) {
          mappedType = 'weather';
        } else if (normalizedIncidentType === 'medical') {
          mappedType = 'medical';
        } else if (normalizedIncidentType === 'accident') {
          mappedType = 'traffic';
        }

        const readableIncidentType = normalizedIncidentType
          ? normalizedIncidentType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : 'General';

        return {
          id: `incident-${incident.id}`,
          title: `Incident: ${readableIncidentType}`,
          message: incident.description,
          alertType: mappedType,
          severity: mappedSeverity,
          locationName: incident.location_name,
          isActive: incident.status !== 'closed',
          expiresAt: null,
          createdAt: incident.created_at
        };
      });

      const combined = [...normalizedAlerts, ...incidentAlerts].filter((alert) => {
        const typeMatch = !filters.type || alert.alertType === filters.type;
        const severityMatch = !filters.severity || alert.severity === filters.severity;
        const query = (filters.search || '').trim().toLowerCase();
        const searchText = `${alert.title} ${alert.message} ${alert.locationName || ''} ${alert.alertType}`.toLowerCase();
        const searchMatch = !query || searchText.includes(query);
        return typeMatch && severityMatch && searchMatch;
      });

      setAlerts(combined);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch safety alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateAlert = () => {
    createAlert();
  };

  const createAlert = async () => {
    if (!newAlert.title.trim() || !newAlert.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      await axios.post('/api/alerts', {
        title: newAlert.title.trim(),
        message: newAlert.message.trim(),
        alertType: newAlert.alertType,
        severity: newAlert.severity
      });

      setShowCreateModal(false);
      setNewAlert({
        title: '',
        message: '',
        alertType: 'general',
        severity: 'warning',
        locationName: ''
      });
      await fetchAlerts();
      toast.success('Alert created successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create alert';
      toast.error(message);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'danger': return <FiAlertCircle />;
      case 'warning': return <FiAlertTriangle />;
      case 'info': return <FiInfo />;
      default: return <FiShield />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'weather': return '🌤️';
      case 'traffic': return '🚗';
      case 'security': return '🛡️';
      case 'medical': return '🏥';
      case 'general': return '📢';
      default: return '⚠️';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <AlertsContainer>
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      </AlertsContainer>
    );
  }

  return (
    <AlertsContainer>
      <Header>
        <Title>Safety Alerts</Title>
        {isPrivileged && (
          <Button onClick={() => setShowCreateModal(true)}>
            <FiPlus />
            Create Alert
          </Button>
        )}
      </Header>

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Type</Label>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="weather">Weather</option>
              <option value="traffic">Traffic</option>
              <option value="security">Security</option>
              <option value="medical">Medical</option>
              <option value="general">General</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Severity</Label>
            <Select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Search</Label>
            <SearchContainer>
              <SearchIcon>
                <FiSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search alerts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </SearchContainer>
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      <AlertsGrid>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertCard 
              key={alert.id} 
              severityColor={getSeverityColor(alert.severity)}
            >
              <AlertHeader>
                <AlertInfo>
                  <AlertTitle>
                    {getSeverityIcon(alert.severity)}
                    {getTypeIcon(alert.alertType)} {alert.title}
                  </AlertTitle>
                  <AlertMeta>
                    <MetaItem>
                      <Badge color={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </MetaItem>
                    <MetaItem>
                      <FiShield />
                      {alert.alertType.replace('_', ' ').toUpperCase()}
                    </MetaItem>
                    {alert.locationName && (
                      <MetaItem>
                        <FiShield />
                        {alert.locationName}
                      </MetaItem>
                    )}
                    <MetaItem>
                      {alert.isActive ? <FiCheckCircle /> : <FiXCircle />}
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </MetaItem>
                  </AlertMeta>
                  <AlertMessage>
                    {alert.message}
                  </AlertMessage>
                </AlertInfo>
                <AlertActions>
                  <ActionButton title="View Details">
                    <FiEye />
                  </ActionButton>
                  {isPrivileged && (
                    <>
                      <ActionButton title="Edit">
                        <FiEdit />
                      </ActionButton>
                      <ActionButton title="Delete" className="danger">
                        <FiTrash2 />
                      </ActionButton>
                    </>
                  )}
                </AlertActions>
              </AlertHeader>
              <AlertFooter>
                <div>
                  <MetaItem>
                    <FiClock />
                    Created: {formatDate(alert.createdAt)}
                  </MetaItem>
                </div>
                <div>
                  {alert.expiresAt && (
                    <MetaItem>
                      <FiClock />
                      {isExpired(alert.expiresAt) ? 'Expired' : 'Expires'}: {formatDate(alert.expiresAt)}
                    </MetaItem>
                  )}
                </div>
              </AlertFooter>
            </AlertCard>
          ))
        ) : (
          <EmptyState>
            <FiShield size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No safety alerts found</h3>
            <p>No alerts match your current filters.</p>
          </EmptyState>
        )}
      </AlertsGrid>

      {showCreateModal && (
        <ModalOverlay onClick={() => setShowCreateModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Create New Alert</ModalTitle>
            <FiltersGrid>
              <FilterGroup>
                <Label>Title</Label>
                <Input
                  value={newAlert.title}
                  onChange={(e) => setNewAlert((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Alert title"
                />
              </FilterGroup>
              <FilterGroup>
                <Label>Type</Label>
                <Select
                  value={newAlert.alertType}
                  onChange={(e) => setNewAlert((prev) => ({ ...prev, alertType: e.target.value }))}
                >
                  <option value="weather">Weather</option>
                  <option value="traffic">Traffic</option>
                  <option value="security">Security</option>
                  <option value="medical">Medical</option>
                  <option value="general">General</option>
                </Select>
              </FilterGroup>
              <FilterGroup>
                <Label>Severity</Label>
                <Select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert((prev) => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </Select>
              </FilterGroup>
              <FilterGroup>
                <Label>Location</Label>
                <Input
                  value={newAlert.locationName}
                  onChange={(e) => setNewAlert((prev) => ({ ...prev, locationName: e.target.value }))}
                  placeholder="Optional location"
                />
              </FilterGroup>
            </FiltersGrid>
            <FilterGroup style={{ marginTop: '0.75rem' }}>
              <Label>Message</Label>
              <Textarea
                value={newAlert.message}
                onChange={(e) => setNewAlert((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Alert details"
              />
            </FilterGroup>
            <ModalActions>
              <ActionButton onClick={() => setShowCreateModal(false)}>
                Cancel
              </ActionButton>
              <Button onClick={handleCreateAlert}>
                <FiPlus />
                Create
              </Button>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </AlertsContainer>
  );
};

export default SafetyAlerts;
