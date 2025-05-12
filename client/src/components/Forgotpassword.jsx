import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestToken = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('http://localhost:3001/forgot-password', { email });
            setSuccess('Token enviado a tu correo. Revisa tu bandeja de entrada.');
            setStep(2);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al enviar el token');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        if (newPassword.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://localhost:3001/resetpassword', {
                token: token.trim(),
                newPassword: newPassword.trim(),
                confirmPassword: confirmPassword.trim()
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Respuesta del servidor:', response.data);

            if (response.data.success) {
                setSuccess('Contraseña actualizada correctamente. Redirigiendo...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(response.data.message || 'Error al actualizar la contraseña');
            }
        } catch (err) {
            console.error('Error completo:', err.response?.data || err);

            if (err.response?.data?.errorType === 'invalid_token') {
                setError('El token es inválido o ha expirado. Solicita uno nuevo.');
                setStep(1);
            } else if (err.response?.data?.errorType === 'password_mismatch') {
                setError('Las contraseñas no coinciden');
            } else {
                setError(err.response?.data?.message || 'Error al conectar con el servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <div className="p-4 border rounded shadow-sm bg-white">
                        <h2 className="text-center mb-4">Recuperar Contraseña</h2>

                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        {step === 1 ? (
                            <Form onSubmit={handleRequestToken}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Ingresa tu email"
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar Token'}
                                </Button>
                            </Form>
                        ) : (
                            <Form onSubmit={handleResetPassword}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Token</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Pega el token recibido"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Nueva Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nueva contraseña"
                                        minLength="6"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite la nueva contraseña"
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </Button>
                            </Form>
                        )}

                        <div className="text-center mt-3">
                            <a href="/login" className="text-decoration-none">Volver al login</a>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword;