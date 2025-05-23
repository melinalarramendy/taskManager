import { Card, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4>Proyectos personales</h4>
        <Button onClick={openModal}>Crear nuevo tablero</Button>
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
      </Card.Header>
      <Card.Body>
        {boards.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {boards.map(board => (
              <Col key={board._id}>
                <Card
                  className="h-100 shadow rounded-4 border-0"
                  style={{
                    background: board.coverImage
                      ? `url(${board.coverImage}) center/cover no-repeat`
                      : "#f8fafc",
                    transition: "box-shadow 0.2s",
                    color: board.coverImage ? "#fff" : undefined,
                    position: "relative",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    console.log(board);
                    navigate(`/boards/${board._id}`);
                  }}
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
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title className="mb-2">{board.title}</Card.Title>
                      <Badge bg="info" className="ms-2">{board.status || 'Activo'}</Badge>
                    </div>
                    <Card.Text className="text-muted" style={{ minHeight: 60 }}>
                      {board.description || <span className="fst-italic text-secondary">Sin descripción</span>}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="bg-white border-0 d-flex justify-content-end gap-2" style={{ position: "relative", zIndex: 2 }}>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      title={board.favorite ? "Quitar de destacados" : "Marcar como destacado"}
                      onClick={e => {
                        e.stopPropagation();
                        onToggleFavorite(board._id, !board.favorite);
                      }}
                      style={{ color: board.favorite ? '#FFD700' : '#bbb' }}
                    >
                      <FaStar />
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      title="Editar"
                      onClick={e => {
                        e.stopPropagation();
                        onEditBoard(board);
                      }}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Eliminar"
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteBoard(board._id);
                      }}
                    >
                      <FiTrash2 />
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No hay tableros creados aún</p>
        )}

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

        {/* Tableros recientes */}
        <div className="mt-4">
          <h5>Visitados recientemente</h5>
          {recentBoards.length > 0 ? (
            <div className="d-flex flex-wrap gap-3">
              {recentBoards.map(board => (
                <Card key={board._id} className="mb-2" style={{ minWidth: '200px' }}>
                  <Card.Body>
                    <Card.Title>{board.name}</Card.Title>
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
  );
};

export default BoardOverview;