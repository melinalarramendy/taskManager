import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Row, Col, Image, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import WorkspaceNavbar from './WorkspaceNavbar';

const FriendProfile = () => {
  const { friendEmail } = useParams();
  const [sharedBoards, setSharedBoards] = useState([]);
  const [friendName, setFriendName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:3003/friends/${encodeURIComponent(friendEmail)}/shared-boards`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSharedBoards(response.data.sharedBoards || []);
        if (response.data.sharedBoards && response.data.sharedBoards.length > 0) {
          const owner = response.data.sharedBoards[0].owner;
          setFriendName(owner?.name || friendEmail.split('@')[0]);
        } else {
          setFriendName(friendEmail.split('@')[0]);
        }
      } catch (err) {
        setError('Error al cargar los tableros compartidos');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedBoards();
  }, [friendEmail]);

  return (
    <>
      <WorkspaceNavbar />
      <div className="container my-4">
        <Row>
          <Col xs={12} md={3} className="border-end pe-md-4 mb-4 mb-md-0">
            <div className="d-flex flex-column align-items-center align-items-md-start">
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(friendName)}&background=random&size=128`}
                roundedCircle
                width={128}
                height={128}
                className="border mb-3"
              />
              <h2 className="fw-bold mb-2">{friendName}</h2>
              <p className="text-muted mb-0">{friendEmail}</p>
            </div>
          </Col>
          <Col xs={12} md={9}>
            <h4 className="mb-3">Tableros en comun</h4>
            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : sharedBoards.length === 0 ? (
              <p>No hay tableros compartidos con este usuario.</p>
            ) : (
              <Row xs={1} md={3} lg={4} className="g-4 justify-content-center">
                {sharedBoards.map(board => (
                  <Col key={board._id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                    <Card style={{ maxWidth: '300px', width: '100%' }} className="h-100 shadow-sm border-0 rounded">
                      {board.coverImage && (
                        <Card.Img
                          variant="top"
                          src={board.coverImage}
                          alt={board.title}
                          style={{ objectFit: 'cover', height: '180px' }}
                        />
                      )}
                      <Card.Body>
                        <Card.Title className="text-truncate" title={board.title}>{board.title}</Card.Title>
                        <Card.Text className="text-truncate" title={board.description}>{board.description}</Card.Text>
                        <Badge bg="secondary" className="mb-2">
                          {board.members.length} miembros
                        </Badge>
                      </Card.Body>
                      <Card.Footer className="bg-white border-0">
                        <Link to={`/boards/${board._id}`}>
                          <Button variant="primary" size="sm" className="w-100">Ver tablero</Button>
                        </Link>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default FriendProfile;

