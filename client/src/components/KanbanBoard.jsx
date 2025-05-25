import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, InputGroup, Dropdown } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
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
    const [editingColumnId, setEditingColumnId] = useState(null);
    const [editingColumnTitle, setEditingColumnTitle] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [columnToEdit, setColumnToEdit] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskDescription, setTaskDescription] = useState('');
    const [taskTitle, setTaskTitle] = useState('');

    const openEditModal = (colId, title) => {
        setColumnToEdit(colId);
        setEditTitle(title);
        setShowEditModal(true);
    };

    const openTaskModal = (listId, task) => {
        setTaskToEdit({ listId, task });
        setTaskTitle(task.title || '');
        setTaskDescription(task.description || '');
        setShowTaskModal(true);
    };

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
                const fixedLists = (response.data.lists || initialLists).map(list => ({
                    ...list,
                    id: list.id || list._id || generateId()
                }));

                const listsWithTaskIds = fixedLists.map(list => ({
                    ...list,
                    tasks: list.tasks.map(task => ({
                        ...task,
                        id: task.id || generateId()
                    }))
                }));

                setLists(listsWithTaskIds);
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
        setLists(newLists);

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

    const handleEditColumn = (colId, title) => {
        console.log('Editando columna:', colId, title);
        setEditingColumnId(String(colId));
        setEditingColumnTitle(title);
    };

    const handleEditColumnSave = (colId) => {
        const newLists = lists.map(list =>
            String(list.id) === String(colId)
                ? { ...list, title: editingColumnTitle }
                : list
        );
        setLists(newLists);
        setEditingColumnId(null);
        setEditingColumnTitle('');
        saveLists(newLists);
    };

    const handleEditColumnModalSave = () => {
        const newLists = lists.map(list =>
            String(list.id) === String(columnToEdit)
                ? { ...list, title: editTitle }
                : list
        );
        setLists(newLists);
        saveLists(newLists);
        setShowEditModal(false);
        setColumnToEdit(null);
        setEditTitle('');
    };

    const handleCopyColumn = (colId) => {
        const column = lists.find(list => String(list.id) === String(colId));
        if (!column) return;
        const copy = {
            ...column,
            id: generateId(),
            title: `${column.title} (Copia)`,
            tasks: column.tasks.map(task => ({ ...task, id: generateId() }))
        };
        const newLists = [...lists, copy];
        setLists(newLists);
        saveLists(newLists);
    };

    const handleDeleteColumn = (colId) => {
        const newLists = lists.filter(list => String(list.id) !== String(colId));
        setLists(newLists);
        saveLists(newLists);
    };

    const handleSaveTaskDescription = () => {
        const newLists = lists.map(list => {
            if (list.id !== taskToEdit.listId) return list;
            return {
                ...list,
                tasks: list.tasks.map(t =>
                    t.id === taskToEdit.task.id
                        ? { ...t, title: taskTitle, description: taskDescription }
                        : t
                )
            };
        });
        setLists(newLists);
        saveLists(newLists);
        setShowTaskModal(false);
        setTaskToEdit(null);
        setTaskTitle('');
        setTaskDescription('');
    };

    const handleDeleteTask = () => {
        if (!taskToEdit) return;
        const newLists = lists.map(list => {
            if (list.id !== taskToEdit.listId) return list;
            return {
                ...list,
                tasks: list.tasks.filter(t => t.id !== taskToEdit.task.id)
            };
        });
        setLists(newLists);
        saveLists(newLists);
        setShowTaskModal(false);
        setTaskToEdit(null);
        setTaskTitle('');
        setTaskDescription('');
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
            <Row id="kanban-board" className="flex-nowrap ms-2 mt-4" style={{ overflowX: 'auto' }}>
                {lists.map(list => {
                    return (
                        <Col key={list.id} style={{ minWidth: 300, maxWidth: 340 }}>
                            <Card className="mb-3 shadow-sm" style={{ background: '#f8fafc', borderRadius: 16 }}>
                                <Card.Body>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        {String(editingColumnId).trim() === String(list.id).trim() ? (
                                            <Form
                                                onSubmit={e => {
                                                    e.preventDefault();
                                                    handleEditColumnSave(list.id);
                                                }}
                                                style={{ flex: 1, marginRight: 8 }}
                                            >
                                                <Form.Control
                                                    type="text"
                                                    value={editingColumnTitle}
                                                    onChange={e => setEditingColumnTitle(e.target.value)}
                                                    autoFocus
                                                    onBlur={() => handleEditColumnSave(list.id)}
                                                />
                                            </Form>
                                        ) : (
                                            <Card.Title style={{ fontWeight: 600, color: '#253858', flex: 1, marginBottom: 0 }}>
                                                {list.title}
                                            </Card.Title>
                                        )}
                                        <Dropdown align="end">
                                            <Dropdown.Toggle
                                                variant="link"
                                                style={{
                                                    color: "#253858",
                                                    fontSize: 22,
                                                    textDecoration: "none",
                                                    boxShadow: "none",
                                                    padding: 0,
                                                    marginLeft: 8,
                                                    lineHeight: 1
                                                }}
                                                id={`dropdown-${list.id}`}
                                            >
                                                <span style={{ fontSize: 22, fontWeight: 700, verticalAlign: "middle" }}>⋮</span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => openEditModal(list.id, list.title)}>
                                                    Editar nombre
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleCopyColumn(list.id)}>
                                                    Copiar columna
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleDeleteColumn(list.id)}>
                                                    Eliminar columna
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <div style={{ minHeight: 60 }}>
                                        {list.tasks.map((task) => (
                                            <Card
                                                key={task.id}
                                                className="mb-2"
                                                style={{ borderLeft: '4px solid #0d6efd', borderRadius: 8, cursor: 'pointer' }}
                                                onClick={() => openTaskModal(list.id, task)}
                                            >
                                                <Card.Body style={{ padding: 10, fontSize: 15 }}>
                                                    {task.title}
                                                </Card.Body>
                                            </Card>
                                        ))}
                                        <InputGroup className="mt-2">
                                            <Form.Control
                                                type="text"
                                                placeholder="Agregar tarea"
                                                value={taskInputs[list.id] || ''}
                                                onChange={e => handleTaskInputChange(list.id, e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleAddTask(list.id);
                                                }}
                                            />
                                            <Button
                                                variant="primary"
                                                onClick={() => handleAddTask(list.id)}
                                            >
                                                +
                                            </Button>
                                        </InputGroup>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
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
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar nombre de columna</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleEditColumnModalSave();
                        }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleEditColumnModalSave}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar tarea</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Título</Form.Label>
                        <Form.Control
                            type="text"
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mt-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={taskDescription}
                            onChange={e => setTaskDescription(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleDeleteTask}>
                        Eliminar tarea
                    </Button>
                    <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSaveTaskDescription}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default KanbanBoard;