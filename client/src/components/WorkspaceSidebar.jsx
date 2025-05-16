import { Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { useLogout } from './Logout';

const WorkspaceSidebar = ({
  workspaces = [],
  sharedWorkspaces = [],
  activeWorkspace,
  onWorkspaceSelect,
}) => {
  const logout = useLogout(); 
  return (
    <Card style={{ width: '18rem', minHeight: '98vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <Card.Header>
          <h5 className="mb-0">Tus espacios de trabajo</h5>
        </Card.Header>
        <ListGroup variant="flush">
          {workspaces.length === 0 && (
            <ListGroup.Item className="text-muted">No tienes espacios propios</ListGroup.Item>
          )}
          {workspaces.map((workspace) => (
            <ListGroup.Item
              key={workspace.id}
              active={activeWorkspace === workspace.id}
              onClick={() => onWorkspaceSelect(workspace.id)}
              style={{ cursor: 'pointer' }}
            >
              {workspace.name}
              {workspace.notificationCount > 0 && (
                <Badge pill bg="danger" className="float-end">
                  {workspace.notificationCount}
                </Badge>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Card.Header className="mt-3">
          <h6 className="mb-0">Invitado en</h6>
        </Card.Header>
        <ListGroup variant="flush">
          {sharedWorkspaces.length === 0 && (
            <ListGroup.Item className="text-muted">No tienes invitaciones</ListGroup.Item>
          )}
          {sharedWorkspaces.map((workspace) => (
            <ListGroup.Item
              key={workspace.id}
              active={activeWorkspace === workspace.id}
              onClick={() => onWorkspaceSelect(workspace.id)}
              style={{ cursor: 'pointer' }}
            >
              {workspace.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      <div className="p-1">
        <Button
          variant="outline-danger"
          className="w-100"
          onClick={logout}
        >
          Cerrar sesión
        </Button>
      </div>
    </Card>
  );
};

export default WorkspaceSidebar;