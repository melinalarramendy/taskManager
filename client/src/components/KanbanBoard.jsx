import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const initialColumns = [
    { id: 1, name: 'Por hacer', tasks: [] },
    { id: 2, name: 'En progreso', tasks: [] },
    { id: 3, name: 'Hecho', tasks: [] }
];

const KanbanBoard = () => {
    const { id } = useParams();
    const [columns, setColumns] = useState(initialColumns);
    const [newColumnName, setNewColumnName] = useState('');
    const [boardName, setBoardName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchBoardName = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/boards/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setBoardName(response.data.title);
        } catch (error) {
            setBoardName('Tablero no encontrado');
        } finally {
            setLoading(false);
        }
    };
    fetchBoardName();
}, [id]);

    const handleAddColumn = () => {
        if (!newColumnName.trim()) return;
        setColumns([
            ...columns,
            { id: Date.now(), name: newColumnName, tasks: [] }
        ]);
        setNewColumnName('');
    };

    return (
        <div style={{ padding: 32, background: '#f4f5f7', minHeight: '100vh' }}>
            <h3 className="mb-4" style={{ fontWeight: 700, color: '#344563' }}>
                {loading ? 'Cargando...' : boardName}
            </h3>
            <Row className="flex-nowrap" style={{ overflowX: 'auto' }}>
                {columns.map(col => (
                    <Col key={col.id} style={{ minWidth: 300, maxWidth: 340 }}>
                        <Card className="mb-3 shadow-sm" style={{ background: '#f8fafc', borderRadius: 16 }}>
                            <Card.Body>
                                <Card.Title style={{ fontWeight: 600, color: '#253858' }}>{col.name}</Card.Title>
                                <div style={{ minHeight: 60 }}>
                                    {col.tasks.length === 0 && (
                                        <div className="text-muted fst-italic">Sin tareas</div>
                                    )}
                                    {col.tasks.map((task, idx) => (
                                        <Card key={idx} className="mb-2" style={{ borderLeft: '4px solid #0d6efd', borderRadius: 8 }}>
                                            <Card.Body style={{ padding: 10, fontSize: 15 }}>
                                                {task}
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                <Col style={{ minWidth: 300, maxWidth: 340 }}>
                    <Card className="mb-3 shadow-sm" style={{ background: '#e9ecef', borderRadius: 16, height: '100%' }}>
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                            <Form
                                onSubmit={e => {
                                    e.preventDefault();
                                    handleAddColumn();
                                }}
                                className="w-100"
                            >
                                <Form.Label className="mb-2" style={{ fontWeight: 500, color: '#253858' }}>Agregar columna</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nombre de la columna"
                                        value={newColumnName}
                                        onChange={e => setNewColumnName(e.target.value)}
                                    />
                                    <Button variant="primary" type="submit">
                                        +
                                    </Button>
                                </InputGroup>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default KanbanBoard;