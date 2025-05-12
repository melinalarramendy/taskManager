import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [serverSuccess, setServerSuccess] = useState('');
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
        if (formData.newPassword.length < 6) newErrors.newPassword = 'Mínimo 6 caracteres';
        if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!token) {
            setServerError('Token inválido o faltante');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:3003/resetpassword', {
                token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setServerSuccess(response.data.message);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setServerError(response.data.message || 'Error desconocido');
            }
        } catch (err) {
            console.error('Error completo:', err);

            if (err.response) {
                if (err.response.data.errorType === 'invalid_token') {
                    setServerError('El token es inválido o ha expirado');
                } else if (err.response.data.errorType === 'password_mismatch') {
                    setServerError('Las contraseñas no coinciden');
                } else {
                    setServerError(err.response.data.message || 'Error del servidor');
                }
            } else if (err.request) {
                setServerError('No se recibió respuesta del servidor');
            } else {
                setServerError('Error al configurar la solicitud');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6} lg={4}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h2 className="text-center mb-4">Restablecer Contraseña</h2>

                            {serverError && <Alert variant="danger">{serverError}</Alert>}
                            {serverSuccess && <Alert variant="success">{serverSuccess}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nueva Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        isInvalid={!!errors.newPassword}
                                        placeholder="Mínimo 6 caracteres"
                                        autoComplete="new-password"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.newPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        isInvalid={!!errors.confirmPassword}
                                        placeholder="Repite tu nueva contraseña"
                                        autoComplete="new-password"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.confirmPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 mb-3"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPassword;