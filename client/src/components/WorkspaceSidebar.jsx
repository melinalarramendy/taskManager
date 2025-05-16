import { Card, ListGroup, Badge } from 'react-bootstrap';

const WorkspaceSidebar = ({ 
  workspaces = [], 
  sharedWorkspaces = [], 
  activeWorkspace, 
  onWorkspaceSelect 
}) => {
  return (
    <Card style={{ width: '18rem' }}>
      <Card.Header>
        <h5>TUS ESPACIOS DE TRABAJO</h5>
      </Card.Header>
      <ListGroup variant="flush">
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
        <h6>ESPACIOS DE TRABAJO EN LOS QUE ERES INVITADO</h6>
      </Card.Header>
      <ListGroup variant="flush">
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
    </Card>
  );
};

export default WorkspaceSidebar;