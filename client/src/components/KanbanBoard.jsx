import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import WorkspaceNavbar from './WorkspaceNavbar';


const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

const initialLists = [
    { id: generateId(), title: 'Por hacer', tasks: [] },
    { id: generateId(), title: 'En progreso', tasks: [] },
    { id: generateId(), title: 'Hecho', tasks: [] }
];

const KanbanBoard = () => {
    const { id } = useParams();
    const [lists, setLists] = useState(initialLists);
    const [newColumnName, setNewColumnName] = useState('');
    const [boardName, setBoardName] = useState('');
    const [loading, setLoading] = useState(true);
    const [boards, setBoards] = useState([]);
    const [recentBoards, setRecentBoards] = useState([]);
    const [starredBoards, setStarredBoards] = useState([]);
    const [ownerName, setOwnerName] = useState('');
    const [taskInputs, setTaskInputs] = useState({});



    useEffect(() => {
        const fetchBoard = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/boards/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setBoardName(response.data.title);
                setLists(response.data.lists || initialLists);
            } catch (error) {
                setBoardName('Tablero no encontrado');
            } finally {
                setLoading(false);
            }
        };
        fetchBoard();
    }, [id]);

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const response = await axios.get('/api/workspaces/boards', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setBoards(response.data.boards || []);
                setOwnerName(response.data.workspace?.name || '');
                setRecentBoards((response.data.boards || []).slice(-4).reverse());
                setStarredBoards((response.data.boards || []).filter(b => b.favorite));
            } catch (error) {
                setBoards([]);
                setRecentBoards([]);
                setStarredBoards([]);
            }
        };
        fetchBoards();
    }, []);

    const handleTaskInputChange = (colId, value) => {
        setTaskInputs(inputs => ({ ...inputs, [colId]: value }));
    };

    const saveLists = async (newLists) => {
        try {
            await axios.put(`/api/boards/${id}/lists`, { lists: newLists }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            alert('Error al guardar los cambios. Intenta nuevamente.');
            console.error('Error al guardar listas:', error);
        }
    };

    const handleAddTask = (listId) => {
        const taskText = (taskInputs[listId] || '').trim();
        if (!taskText) return;
        const newTask = { id: generateId(), title: taskText };
        const newLists = lists.map(list =>
            (list.id === listId || list._id === listId)
                ? { ...list, tasks: [newTask, ...list.tasks] }
                : list
        );
        setLists(newLists);
        setTaskInputs(inputs => ({ ...inputs, [listId]: '' }));
        saveLists(newLists);
    };

    const handleAddColumn = () => {
        if (!newColumnName.trim()) return;
        const newLists = [
            ...lists,
            { id: generateId(), title: newColumnName, tasks: [] }
        ];
        setLists(newLists);
        setNewColumnName('');
        saveLists(newLists);
    };

    return (
        <>
            <WorkspaceNavbar
                boardName={boardName}
                loading={loading}
                boards={boards}
                recentBoards={recentBoards}
                starredBoards={starredBoards}
                ownerName={ownerName}
                onBoardSelect={id => window.location.href = `/boards/${id}`}
            />
            <Row className="flex-nowrap ms-2 mt-4" style={{ overflowX: 'auto' }}>
                {lists.map(list => (
                    <Col key={list.id || list._id} style={{ minWidth: 300, maxWidth: 340 }}>
                        <Card className="mb-3 shadow-sm" style={{ background: '#f8fafc', borderRadius: 16 }}>
                            <Card.Body>
                                <Card.Title style={{ fontWeight: 600, color: '#253858' }}>{list.title}</Card.Title>
                                <div style={{ minHeight: 60 }}>
                                    {list.tasks.length === 0 && (
                                        <div className="text-muted fst-italic mb-2">Sin tareas</div>
                                    )}
                                    {list.tasks.map((task) => (
                                        <Card key={task.id} className="mb-2" style={{ borderLeft: '4px solid #0d6efd', borderRadius: 8 }}>
                                            <Card.Body style={{ padding: 10, fontSize: 15 }}>
                                                {task.title}
                                            </Card.Body>
                                        </Card>
                                    ))}
                                    <InputGroup className="mt-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Agregar tarea"
                                            value={taskInputs[list.id || list._id] || ''}
                                            onChange={e => handleTaskInputChange(list.id || list._id, e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleAddTask(list.id || list._id);
                                            }}
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={() => handleAddTask(list.id || list._id)}
                                        >
                                            +
                                        </Button>
                                    </InputGroup>
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
        </>
    );
};

export default KanbanBoard;