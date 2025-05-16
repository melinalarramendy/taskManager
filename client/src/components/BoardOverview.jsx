import { Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

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
  setNewBoardDescription,
  onEditBoard,
  editModalOpen,
  closeEditModal,
  editBoardTitle,
  setEditBoardTitle,
  editBoardDescription,
  setEditBoardDescription,
  handleEditBoard
}) => {
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => onCreateNewBoard(newBoardTitle, newBoardDescription)}
              disabled={!newBoardTitle}
            >
              Crear
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Header>
      <Card.Body>
        {boards.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {boards.map(board => (
                <tr key={board._id}>
                  <td>{board.title}</td>
                  <td>{board.description}</td>
                  <td>
                    <Badge bg="info">{board.status || 'Activo'}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      title="Editar"
                      onClick={() => onEditBoard(board)}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Eliminar"
                      onClick={() => onDeleteBoard(board._id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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