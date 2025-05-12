import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulario enviado');
    if (!validateForm()) {
      console.log('Validación fallida', errors);
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('Enviando datos:', formData);
      const response = await axios.post('http://localhost:3003/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, {
        headers: {
            'Content-Type': 'application/json'
        }
      });
      
      localStorage.setItem('token', response.data.token);
      navigate('/login');
    } catch (err) {
      console.error('Error en la solicitud:', err);
      setServerError(err.response?.data?.message || 'Error al registrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <div className="p-4 border rounded-3 shadow-sm bg-white">
            <h2 className="text-center mb-4">Registrate</h2>
            
            {serverError && <Alert variant="danger">{serverError}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                  placeholder="Ej: Juan Pérez"
                  autoComplete="name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="ejemplo@mail.com"
                  autoComplete="email"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
              </Button>

              <div className="text-center">
                <small className="text-muted">
                  ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
                </small>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;