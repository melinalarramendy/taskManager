import { useState, useEffect } from 'react';
import { Navbar, Nav, Modal, ListGroup, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { FiUser, FiSearch, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useLogout } from './Logout';
import Swal from 'sweetalert2';
import axios from 'axios';

const WorkspaceNavbar = ({
  boards = [],
  workspaces = [],
  sharedWorkspaces = [],
  recentBoards = [],
  starredBoards = [],
  ownerName = '',
  onBoardSelect
}) => {
  const [showBoards, setShowBoards] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(true);
  const logout = useLogout();

  const navigate = useNavigate();

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(search.toLowerCase())
  );

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las notificaciones'
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Navbar
        bg="light"
        expand="lg"
        collapseOnSelect
        className="shadow-sm px-3"
        style={{ minHeight: 64 }}
      >
        <Navbar.Brand
          className="fw-bold"
          style={{ letterSpacing: 1, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          TaskManager
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-content" />
        <Navbar.Collapse id="navbar-content">
          <Nav className="me-auto">
            <Nav.Link onClick={() => setShowBoards(true)}>Tableros</Nav.Link>
            <Nav.Link onClick={() => setShowRecent(true)}>Tableros recientes</Nav.Link>
            <Nav.Link onClick={() => setShowStarred(true)}>Tableros marcados</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center gap-2">

            <InputGroup className="my-2 my-lg-0" style={{ maxWidth: 250 }}>
              <InputGroup.Text>
                <FiSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </InputGroup>

            <Dropdown align="end">
              <Dropdown.Toggle
                as="button"
                variant="light"
                className="rounded-circle border-0 p-0 d-flex align-items-center justify-content-center position-relative"
                style={{ width: 40, height: 40, boxShadow: 'none' }}
                id="dropdown-notifications"
              >
                <FiBell size={22} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: '#dc3545',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: 12,
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu
                align="end"
                style={{
                  minWidth: 350,
                  maxWidth: 400,
                  padding: 0,
                  borderRadius: 16,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ padding: '16px 20px 8px 20px', borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 18 }}>
                  Notificaciones
                  <span style={{ float: 'right', fontWeight: 400, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Mostrar solo no leídos&nbsp;
                    <Form.Check
                      type="switch"
                      id="switch-unread"
                      checked={showOnlyUnread}
                      onChange={() => setShowOnlyUnread(v => !v)}
                      style={{ marginBottom: 0 }}
                    />
                  </span>
                </div>
                <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                  {notifications.filter(n => !showOnlyUnread || !n.read).length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-4" style={{ minHeight: 180 }}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
                        alt="No notifications"
                        style={{ width: 64, height: 64, opacity: 0.7, marginBottom: 12 }}
                      />
                      <div className="text-muted" style={{ fontSize: 17, fontWeight: 500 }}>
                        No tienes notificaciones {showOnlyUnread ? 'sin leer' : ''}
                      </div>
                    </div>
                  ) : (
                    notifications
                      .filter(n => !showOnlyUnread || !n.read)
                      .map(n => (
                        <div
                          key={n._id}
                          style={{
                            background: n.read ? '#fff' : '#e9f5ff',
                            padding: '12px 20px',
                            borderBottom: '1px solid #eee',
                            cursor: n.link ? 'pointer' : 'default'
                          }}
                          onClick={async () => {
                            if (!n.read) {
                              await axios.put(`/api/notifications/${n._id}/read`, {}, {
                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                              });
                              setNotifications(notifications =>
                                notifications.map(notif =>
                                  notif._id === n._id ? { ...notif, read: true } : notif
                                )
                              );
                            }
                            if (n.link) window.location.href = n.link;
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{n.title}</div>
                          <div style={{ fontSize: 14 }}>{n.message}</div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-user"
                className="rounded-circle border-0 p-0"
                style={{ width: 40, height: 40 }}
              >
                <div
                  className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle"
                  style={{ width: 40, height: 40, fontSize: 22 }}
                >
                  <FiUser />
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>{ownerName}</Dropdown.Header>
                <Dropdown.Item onClick={logout}>Cerrar sesión</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Navbar>

      <Modal show={showBoards} onHide={() => setShowBoards(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Todos los tableros</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {filteredBoards.length === 0 && (
              <ListGroup.Item className="text-muted">No hay tableros</ListGroup.Item>
            )}
            {filteredBoards.map(board => (
              <ListGroup.Item
                key={board._id}
                action
                onClick={() => { onBoardSelect && onBoardSelect(board._id); setShowBoards(false); }}
              >
                {board.title}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      <Modal show={showRecent} onHide={() => setShowRecent(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tableros recientes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {recentBoards.length === 0 && (
              <ListGroup.Item className="text-muted">No hay tableros recientes</ListGroup.Item>
            )}
            {recentBoards.map(board => (
              <ListGroup.Item
                key={board._id}
                action
                onClick={() => { onBoardSelect(board._id); setShowRecent(false); }}
              >
                {board.title}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      <Modal show={showStarred} onHide={() => setShowStarred(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tableros marcados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {starredBoards.length === 0 && (
              <ListGroup.Item className="text-muted">No hay tableros marcados</ListGroup.Item>
            )}
            {starredBoards.map(board => (
              <ListGroup.Item
                key={board._id}
                action
                onClick={() => { onBoardSelect(board._id); setShowStarred(false); }}
              >
                {board.title}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default WorkspaceNavbar;