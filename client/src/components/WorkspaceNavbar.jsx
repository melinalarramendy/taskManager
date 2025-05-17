import { useState } from 'react';
import { Navbar, Nav, Button, Modal, ListGroup, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { FiUser } from 'react-icons/fi';
import { useLogout } from './Logout';

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
  const logout = useLogout();

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    
    <>
      <Navbar bg="light" expand="lg" className="shadow-sm px-3" style={{ minHeight: 64 }}>
        <Navbar.Brand className="fw-bold" style={{ letterSpacing: 1 }}>TaskManager</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link onClick={() => setShowBoards(true)}>Tableros</Nav.Link>
          <Nav.Link onClick={() => setShowRecent(true)}>Tableros recientes</Nav.Link>
          <Nav.Link onClick={() => setShowStarred(true)}>Tableros marcados</Nav.Link>
        </Nav>
        <InputGroup className="me-3" style={{ maxWidth: 250 }}>
          <Form.Control
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </InputGroup>
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" id="dropdown-user" className="rounded-circle border-0 p-0" style={{ width: 40, height: 40 }}>
            <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle" style={{ width: 40, height: 40, fontSize: 22 }}>
              <FiUser />
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>{ownerName}</Dropdown.Header>
            <Dropdown.Item onClick={logout}>Cerrar sesión</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar>

      {/* Modal Tableros */}
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

      {/* Modal Tableros recientes */}
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

      {/* Modal Tableros marcados */}
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