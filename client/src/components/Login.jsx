import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import Swal from 'sweetalert2';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';

    if (!formData.password) newErrors.password = 'Contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validación',
        text: Object.values(newErrors).join('\n'),
        confirmButtonColor: '#3085d6'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:3003/login', {
        email: formData.email,
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Respuesta del servidor incompleta');
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name
      }));

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso',
        confirmButtonColor: '#3085d6',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/dashboard', { replace: true });

    } catch (err) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (err.response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {

        errorMessage = err.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#d33'
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FiLogIn size={32} className="text-primary mb-2" />
                <h2>Iniciar Sesión</h2>
                <p className="text-muted">Ingresa a tu cuenta</p>
              </div>

              {serverError && (
                <Alert variant="danger" dismissible onClose={() => setServerError('')}>
                  {serverError}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="tucorreo@ejemplo.com"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    placeholder="••••••••"
                    required
                    minLength="6"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                  <div className="text-end mt-2">
                    <Link to="/forgot-password" className="text-decoration-none small">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3 py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Iniciando...
                    </>
                  ) : 'Ingresar'}
                </Button>

                <div className="text-center mt-3">
                  <span className="text-muted">¿No tienes cuenta? </span>
                  <Link to="/register" className="text-decoration-none">
                    Regístrate
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;