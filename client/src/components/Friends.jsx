import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, InputGroup, Badge, Modal, Spinner, Alert, Row, Col, Image } from 'react-bootstrap';
import { FiUserPlus, FiUserX, FiMail } from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import WorkspaceNavbar from './WorkspaceNavbar';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true
});

const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState({
    friends: true,
    requests: true,
    sending: false
  });
  const [error, setError] = useState(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [boards, setBoards] = useState([]);
  const [recentBoards, setRecentBoards] = useState([]);
  const [starredBoards, setStarredBoards] = useState([]);
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await axios.get('/api/workspaces/boards', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBoards(response.data.boards || []);
        setOwnerName(response.data.workspace?.name || '');
        setRecentBoards((response.data.boards || []).slice(-4).reverse());
        setStarredBoards((response.data.boards || []).filter(b => b.favorite));
      } catch (error) {
        setBoards([]);
        setRecentBoards([]);
        setStarredBoards([]);
      }
    };
    fetchBoards();
  }, []);

  const handleBoardSelect = (boardId) => {
    navigate(`/boards/${boardId}`);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);

        const [friendsRes, requestsRes] = await Promise.all([
          axios.get('http://localhost:3003/friends', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:3003/friends/requests', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        const formattedFriends = Array.isArray(friendsRes.data)
          ? friendsRes.data.map(friend => {
            const email = friend.email || (typeof friend === 'string' ? friend : '');
            const name = friend.name || (email ? email.split('@')[0] : 'Usuario');
            return {
              ...friend,
              email,
              name,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
              sharedBoards: friend.sharedBoards || 0
            };
          }).filter(friend => friend.email)
          : [];

        setFriends(formattedFriends);
        setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      } catch (error) {
        console.error('Error loading friends:', error);
        setError('Error al cargar los datos');
        Toast.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos'
        });
      } finally {
        setLoading({ friends: false, requests: false, sending: false });
      }
    };

    loadData();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, sending: true });

    try {
      await axios.post('http://localhost:3003/friends/request', { to: friendEmail }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      Toast.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: `Solicitud enviada a ${friendEmail}`
      });

      setFriendEmail('');
      const { data } = await axios.get('http://localhost:3003/friends/requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(data);
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al enviar solicitud'
      });
    } finally {
      setLoading({ ...loading, sending: false });
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const request = requests.find(r => r._id === requestId);
      if (!request) throw new Error('Solicitud no encontrada');

      await axios.post('http://localhost:3003/friends/accept', { from: request.from }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      Toast.fire({
        icon: 'success',
        title: 'Solicitud aceptada'
      });

      const [friendsRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:3003/friends', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:3003/friends/requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo aceptar la solicitud: ${error.message}`
      });
    }
  };

  const handleRemoveFriend = async (friendEmail) => {
    try {
      await axios.delete(`http://localhost:3003/friends/${encodeURIComponent(friendEmail)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setFriends(friends.filter(f => f.email !== friendEmail));
      Toast.fire({
        icon: 'success',
        title: 'Amigo eliminado'
      });
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar al amigo'
      });
    }
  };

  const handleViewProfile = (email) => {
    navigate(`/profile/${encodeURIComponent(email)}`);
  };

  return (
    <>
      <WorkspaceNavbar
        boards={boards}
        recentBoards={recentBoards}
        starredBoards={starredBoards}
        ownerName={ownerName}
        onBoardSelect={handleBoardSelect}
      />
      <div className="friends-container m-4">
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h4>Mis Amigos</h4>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowRequestsModal(true)}
                disabled={loading.requests}
              >
                {loading.requests ? (
                  <>
                    <Spinner animation="border" size="sm" /> Cargando...
                  </>
                ) : (
                  <>
                    <FiUserPlus /> Solicitudes ({requests.length})
                  </>
                )}
              </Button>
            </div>
          </Card.Header>

          <Card.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSendRequest} className="mb-4">
              <InputGroup>
                <Form.Control
                  type="email"
                  placeholder="Email del amigo"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  required
                  disabled={loading.sending}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading.sending || !friendEmail}
                >
                  {loading.sending ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      <FiUserPlus /> Enviar solicitud
                    </>
                  )}
                </Button>
              </InputGroup>
            </Form>

            {loading.friends ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
                <p>Cargando amigos...</p>
              </div>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <Col key={friend.email}>
                      <Card className="h-100">
                        <div className="d-flex justify-content-center pt-3">
                          <Image
                            src={friend.avatar}
                            roundedCircle
                            width={100}
                            height={100}
                            className="border"
                          />
                        </div>
                        <Card.Body className="text-center">
                          <Card.Title>{friend.name}</Card.Title>
                          <Card.Text className="text-muted">
                            <FiMail className="me-2" />
                            <span
                              style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                              onClick={() => handleViewProfile(friend.email)}
                              title="Ver perfil"
                            >
                              {friend.email}
                            </span>
                          </Card.Text>
                          <Badge bg="secondary" className="mb-2">
                            {friend.sharedBoards} tableros compartidos
                          </Badge>
                        </Card.Body>
                        <Card.Footer className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveFriend(friend.email)}
                            title="Eliminar amigo"
                          >
                            <FiUserX /> Eliminar
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col className="text-center py-5">
                    <div className="text-muted">
                      <FiUserX size={48} className="mb-3" />
                      <h5>No tienes amigos agregados aún</h5>
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </Card.Body>
        </Card>

        <Modal show={showRequestsModal} onHide={() => setShowRequestsModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Solicitudes de amistad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {requests.length > 0 ? (
              requests.map((request) => (
                <Card key={request._id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{request.from}</strong>
                        <div className="text-muted small">Te envió una solicitud</div>
                      </div>
                      <div>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleRequestAction(request._id, 'accept')}
                        >
                          Aceptar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRequestAction(request._id, 'reject')}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="text-center py-3 text-muted">
                No tienes solicitudes pendientes
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRequestsModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Friends;