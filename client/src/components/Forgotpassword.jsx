import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestToken = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('http://localhost:3003/forgot-password', { email });
            await Swal.fire({
                icon: 'success',
                title: 'Token enviado',
                text: 'Revisa tu correo electrónico.',
                confirmButtonColor: '#3085d6'
            });
            setStep(2);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Error al enviar el token',
                confirmButtonColor: '#d33'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
                confirmButtonColor: '#d33'
            });
            return;
        }

        if (newPassword.length < 6) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La contraseña debe tener al menos 6 caracteres',
                confirmButtonColor: '#d33'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3003/reset-password', {
                token: token.trim(),
                newPassword: newPassword.trim(),
                confirmPassword: confirmPassword.trim()
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Contraseña actualizada',
                    text: 'Redirigiendo al login...',
                    confirmButtonColor: '#3085d6',
                    timer: 1800,
                    showConfirmButton: false
                });
                setTimeout(() => navigate('/login'), 1800);
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.data.message || 'Error al actualizar la contraseña',
                    confirmButtonColor: '#d33'
                });
            }
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Error al enviar el token',
                confirmButtonColor: '#d33'
            });
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