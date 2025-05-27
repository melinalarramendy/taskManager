import { useState } from 'react';
import { Navbar, Nav, Button, Modal, ListGroup, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { FiUser, FiSearch, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(search.toLowerCase())
  );

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

            <Button
              variant="light"
              className="rounded-circle border-0 p-0 d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <FiBell size={22} />
            </Button>

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