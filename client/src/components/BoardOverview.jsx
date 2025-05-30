import { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Modal, Form, Row, Col, Image, InputGroup, Spinner, ListGroup } from 'react-bootstrap';
import { FiEdit2, FiTrash2, FiUser, FiMail, FiUserX, FiShare2 } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true
});

const BoardOverview = ({
  boards = [],
  recentBoards = [],
  onCreateNewBoard,
  onDeleteBoard,
  showModal,
  openModal,
  closeModal,
  newBoardTitle,
  setNewBoardTitle,
  newBoardDescription,
  newBoardImage,
  setNewBoardDescription,
  setNewBoardImage,
  onEditBoard,
  editModalOpen,
  closeEditModal,
  editBoardTitle,
  setEditBoardTitle,
  editBoardDescription,
  setEditBoardDescription,
  editBoardImage,
  setEditBoardImage,
  resizeImage,
  onToggleFavorite,
  handleEditBoard
}) => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState({
    friends: true,
    sending: false
  });
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef(null);

  const loadFriends = async () => {
    try {
      setError(null);
      const response = await axios.get('http://localhost:3003/friends', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const formattedFriends = Array.isArray(response.data)
        ? response.data.map(friend => {
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
    } catch (error) {
      console.error('Error loading friends:', error);
      setError('Error al cargar los amigos');
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los amigos'
      });
    } finally {
      setLoading({ ...loading, friends: false });
    }
  };

  useEffect(() => {
    loadFriends();
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendFriendRequest = async (e) => {
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
      await loadFriends();
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo enviar la solicitud'
      });
    } finally {
      setLoading({ ...loading, sending: false });
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

  const handleFriendClick = (friend, event) => {
    event.preventDefault();
    setSelectedFriend(friend);
    setContextPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const handleInviteToBoard = (board) => {
    setSelectedBoard(board);
    setShowShareModal(true);
    setShowContextMenu(false);
  };

  const handleSendInvitation = async () => {
    try {
      await axios.post( 
        'http://localhost:3003/boards/share',
        {
          boardId: selectedBoard._id,
          email: selectedFriend.email,
          permission: 'editor'
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      Toast.fire({ icon: 'success', title: 'Invitación enviada' });
      setShowShareModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al compartir";
      Toast.fire({ icon: 'error', title: 'Error', text: errorMessage });
    }
  };


  return (
    <Row className="g-4">
      <Col xs={12} md={9}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>Tableros personales</h5>
            <Button size="sm" onClick={openModal}>+ Nuevo tablero</Button>
          </Card.Header>
          <Card.Body>
            {boards.length > 0 ? (
              <Row xs={1} sm={2} lg={3} className="g-3">
                {boards.map(board => (
                  <Col key={board._id}>
                    <Card
                      className="h-100 shadow-sm"
                      style={{
                        background: board.coverImage
                          ? `url(${board.coverImage}) center/cover no-repeat`
                          : "#f8fafc",
                        color: board.coverImage ? "#fff" : undefined,
                        position: "relative",
                        cursor: "pointer"
                      }}
                      onClick={() => navigate(`/boards/${board._id}`)}
                    >
                      {board.coverImage && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.25)",
                          zIndex: 1
                        }} />
                      )}
                      <Card.Body style={{ position: "relative", zIndex: 2 }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <Card.Title className="mb-1" style={{ fontSize: '1rem' }}>{board.title}</Card.Title>
                          <Badge bg="info" className="ms-2" style={{ fontSize: '0.65rem' }}>
                            {board.status || 'Activo'}
                          </Badge>
                        </div>
                        <Card.Text className="small" style={{ minHeight: '3rem' }}>
                          {board.description || <span className="fst-italic text-secondary">Sin descripción</span>}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer className="bg-white border-0 d-flex justify-content-end gap-1" style={{ position: "relative", zIndex: 2 }}>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="p-1"
                          onClick={e => {
                            e.stopPropagation();
                            onToggleFavorite(board._id, !board.favorite);
                          }}
                          style={{ color: board.favorite ? '#FFD700' : '#bbb' }}
                        >
                          <FaStar size={14} />
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="p-1"
                          onClick={e => {
                            e.stopPropagation();
                            onEditBoard(board);
                          }}
                        >
                          <FiEdit2 size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="p-1"
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteBoard(board._id);
                          }}
                        >
                          <FiTrash2 size={14} />
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-muted small">No hay tableros creados aún</p>
            )}

            <Modal show={showModal} onHide={closeModal}>
              <Modal.Header closeButton>
                <Modal.Title>Crear nuevo tablero</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group>
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                      type="text"
                      value={newBoardTitle}
                      onChange={e => setNewBoardTitle(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={newBoardDescription}
                      onChange={e => setNewBoardDescription(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Imagen de fondo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        const file = e.target.files[0];
                        if (file) {
                          const base64 = await resizeImage(file);
                          setNewBoardImage(base64);
                        }
                      }}
                    />
                    {editBoardImage && (
                      <div className="mt-2">
                        <img src={editBoardImage} alt="preview" style={{ width: "100%", borderRadius: 8, maxHeight: 120, objectFit: "cover" }} />
                      </div>
                    )}
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onCreateNewBoard(newBoardTitle, newBoardDescription, newBoardImage)}
                  disabled={!newBoardTitle}
                >
                  Crear
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal show={editModalOpen} onHide={closeEditModal}>
              <Modal.Header closeButton>
                <Modal.Title>Editar tablero</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group>
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                      type="text"
                      value={editBoardTitle}
                      onChange={e => setEditBoardTitle(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={editBoardDescription}
                      onChange={e => setEditBoardDescription(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Imagen de fondo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        const file = e.target.files[0];
                        if (file) {
                          const resized = await resizeImage(file, 800, 600);
                          setEditBoardImage(resized);
                        }
                      }}
                    />
                    {editBoardImage && (
                      <div className="mt-2">
                        <img src={editBoardImage} alt="preview" style={{ width: "100%", borderRadius: 8, maxHeight: 120, objectFit: "cover" }} />
                      </div>
                    )}
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeEditModal}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleEditBoard}
                  disabled={!editBoardTitle}
                >
                  Guardar cambios
                </Button>
              </Modal.Footer>
            </Modal>

            <div className="mt-4">
              <h5>Visitados recientemente</h5>
              {recentBoards.length > 0 ? (
                <div className="d-flex flex-wrap gap-3">
                  {recentBoards.slice(0, 5).map(board => (
                    <Card
                      key={`recent-${board._id}`}
                      className="mb-2"
                      style={{
                        minWidth: '200px',
                        background: board.coverImage
                          ? `url(${board.coverImage}) center/cover no-repeat`
                          : "#f8fafc",
                        color: board.coverImage ? "#fff" : undefined,
                        position: "relative",
                        cursor: "pointer"
                      }}
                      onClick={() => navigate(`/boards/${board._id}`)}
                    >
                      {board.coverImage && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.25)",
                          borderRadius: "1rem",
                          zIndex: 1
                        }} />
                      )}
                      <Card.Body style={{ position: "relative", zIndex: 2 }}>
                        <Card.Title>{board.title}</Card.Title>
                        <Badge bg="info">{board.status || 'Activo'}</Badge>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>No hay tableros visitados recientemente</p>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={3}>
        <Card className="h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>Amigos</h5>
          </Card.Header>
          <Card.Body className="d-flex flex-column">
            <Form onSubmit={handleSendFriendRequest} className="mb-3">
              <InputGroup>
                <Form.Control
                  type="email"
                  placeholder="Agregar amigo"
                  value={friendEmail}
                  onChange={e => setFriendEmail(e.target.value)}
                  required
                  disabled={loading.sending}
                  size="sm"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading.sending || !friendEmail}
                >
                  {loading.sending ? '...' : '+'}
                </Button>
              </InputGroup>
            </Form>

            <div className="flex-grow-1 overflow-auto">
              {loading.friends ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : friends.length > 0 ? (
                <ListGroup variant="flush">
                  {friends.map(friend => (
                    <ListGroup.Item
                      key={friend._id || friend.email}
                      className="p-2"
                      onContextMenu={(e) => handleFriendClick(friend, e)}
                      onClick={(e) => handleFriendClick(friend, e)}
                    >
                      <div className="d-flex align-items-center">
                        <Image
                          src={friend.avatar}
                          roundedCircle
                          width={40}
                          height={40}
                          className="border me-2"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || friend.email)}&background=random`;
                          }}
                        />
                        <div className="text-truncate">
                          <div className="fw-bold small">{friend.name}</div>
                          <div className="text-muted x-small">
                            <FiMail className="me-1" />
                            <span className="text-truncate">{friend.email}</span>
                          </div>
                        </div>
                        <Badge bg="secondary" className="ms-auto" pill>
                          {friend.sharedBoards || 0}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-3 text-muted small">
                  <FiUser size={16} className="mb-1" />
                  <div>No tienes amigos</div>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Menú contextual */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu shadow"
          style={{
            position: 'fixed',
            left: `${contextPosition.x}px`,
            top: `${contextPosition.y}px`,
            zIndex: 1000
          }}
        >
          <ListGroup variant="flush">
            <ListGroup.Item action className="small">
              <div className="d-flex align-items-center">
                <Image
                  src={selectedFriend?.avatar}
                  roundedCircle
                  width={30}
                  height={30}
                  className="border me-2"
                />
                <span className="fw-bold">{selectedFriend?.name}</span>
              </div>
            </ListGroup.Item>
            <ListGroup.Item action className="small">
              <FiMail className="me-2" />
              {selectedFriend?.email}
            </ListGroup.Item>
            <ListGroup.Item
              action
              className="small fw-bold text-primary"
              onClick={() => setShowShareModal(true)}
            >
              <FiShare2 className="me-2" />
              Invitar a tablero
            </ListGroup.Item>
            <ListGroup.Item
              action
              className="small text-danger"
              onClick={() => handleRemoveFriend(selectedFriend?.email)}
            >
              <FiUserX className="me-2" />
              Eliminar amigo
            </ListGroup.Item>
          </ListGroup>
        </div>
      )}

      {/* Modal para compartir tablero */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invitar a tablero</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Invitar a <strong>{selectedFriend?.name}</strong> ({selectedFriend?.email}) como colaborador
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Seleccionar tablero</Form.Label>
            <Form.Select
              onChange={(e) => setSelectedBoard(boards.find(b => b._id === e.target.value))}
            >
              <option value="">Selecciona un tablero</option>
              {boards.map(board => (
                <option key={board._id} value={board._id}>
                  {board.title} ({board.status || 'Activo'})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Permisos</Form.Label>
            <Form.Select>
              <option value="editor">Editor (puede editar)</option>
              <option value="viewer">Solo lectura</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShareModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSendInvitation}
            disabled={!selectedBoard}
          >
            Enviar invitación
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default BoardOverview;