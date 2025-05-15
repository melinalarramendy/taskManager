import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { EmojiFrown, HouseDoor, ArrowLeft } from 'react-bootstrap-icons';

const Error404 = () => {
  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
          <Card className="shadow-sm text-center p-4">
            <Card.Body>
              <div className="mb-4">
                <EmojiFrown size={80} className="text-danger" />
              </div>
              <h1 className="display-4 text-danger mb-3">404</h1>
              <h2 className="mb-4">Página no encontrada</h2>
              <p className="lead text-muted mb-4">
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button 
                  variant="outline-primary" 
                  as={Link} 
                  to="/" 
                  className="d-flex align-items-center gap-2"
                >
                  <HouseDoor /> Ir al login
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => window.history.back()} 
                  className="d-flex align-items-center gap-2"
                >
                  <ArrowLeft /> Volver Atrás
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Error404;