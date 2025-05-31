import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import WorkspaceNavbar from './WorkspaceNavbar';
import BoardOverview from './BoardOverview';
import axios from 'axios';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [sharedWorkspaces, setSharedWorkspaces] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [recentBoards, setRecentBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardImage, setNewBoardImage] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#ffffff');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBoardId, setEditBoardId] = useState(null);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');
  const [editBoardImage, setEditBoardImage] = useState('');
  const [editBoardColor, setEditBoardColor] = useState('#ffffff');
  const [taskColor, setTaskColor] = useState('#ffffff');

  const [user, setUser] = useState(null);


  const navigate = useNavigate();


  const openModal = () => {
    setNewBoardTitle('');
    setNewBoardDescription('');
    setNewBoardColor('#ffffff');
    setTaskColor(task.color || '#ffffff');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);


  const openEditModal = (board) => {
    setEditBoardId(board._id);
    setEditBoardTitle(board.title);
    setEditBoardDescription(board.description);
    setEditBoardImage(board.coverImage || '');
    setEditBoardColor(board.color || '#ffffff');
    setEditModalOpen(true);
  };

  const closeEditModal = () => setEditModalOpen(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });


  const handleCreateNewBoard = async (title, description, coverImage, color) => {
    try {

      setError(null);

      const response = await axios.post('/api/boards', {
        title,
        description,
        coverImage,
        color
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setBoards(prev => [response.data.board, ...prev]);
        setRecentBoards(prev => [response.data.board, ...prev.slice(0, 1)]);
        closeModal();
        Toast.fire({
          icon: 'success',
          title: '¡Tablero creado!',
          text: 'El tablero se creó correctamente.'
        });
      }
    } catch (error) {
      console.error('Error completo:', error);
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo crear el tablero. Inténtalo de nuevo.'
      });
    }
  };

  const handleBoardSelect = (boardId) => {
    navigate(`/boards/${boardId}`);
  };

  const handleDeleteBoard = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción eliminará el tablero!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/api/boards/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBoards(prev => prev.filter(board => board._id !== id));
      Toast.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El tablero ha sido eliminado.'
      });
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar el tablero'
      });
    }
  };


  const handleEditBoard = async () => {
    try {
      const response = await axios.put(`/api/boards/${editBoardId}`, {
        title: editBoardTitle,
        description: editBoardDescription,
        coverImage: editBoardImage,
        color: editBoardColor
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setBoards(prev =>
        prev.map(board =>
          board._id === editBoardId
            ? { ...board, title: editBoardTitle, description: editBoardDescription, coverImage: editBoardImage, color: editBoardColor }
            : board
        )
      );
      setRecentBoards(prev =>
        prev.map(board =>
          board._id === editBoardId
            ? { ...board, title: editBoardTitle, description: editBoardDescription, coverImage: editBoardImage, color: editBoardColor }
            : board
        )
      );
      closeEditModal();
      Toast.fire({
        icon: 'success',
        title: '¡Editado!',
        text: 'El tablero fue actualizado.'
      });
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo editar el tablero.'
      });
    }
  };

  const handleToggleFavorite = async (boardId, newValue) => {
    try {
      await axios.put(`/api/boards/${boardId}/favorite`, { favorite: newValue }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setBoards(prev =>
        prev.map(b => b._id === boardId ? { ...b, favorite: newValue } : b)
      );
      Toast.fire({
        icon: 'success',
        title: newValue ? 'Agregado a destacados' : 'Quitado de destacados',
        text: '',
        timer: 1200
      });
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el favorito'
      });
    }
  };

  const handleEditColumn = (colId, title) => {
    setEditingColumnId(colId);
    setEditingColumnTitle(title);
  };

  const handleEditColumnSave = (colId) => {
    const newLists = lists.map(list =>
      (list.id || list._id) === colId
        ? { ...list, title: editingColumnTitle }
        : list
    );
    setLists(newLists);
    setEditingColumnId(null);
    setEditingColumnTitle('');
    saveLists(newLists);
  };

  function resizeImage(file, maxWidth = 800, maxHeight = 600) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        const img = new window.Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width = width * scale;
            height = height * scale;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {

        const response = await axios.get('/api/workspaces/boards', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        setUser(response.data?.user || null);

        const boardsData = response.data?.boards || [];
        const workspaceData = response.data?.workspace || {};

        setBoards(boardsData);
        setRecentBoards(boardsData.filter(b => b.title).slice(-5).reverse());

        setActiveWorkspace(workspaceData.id || null);

      } catch (error) {
        console.error('Error fetching boards:', error);
        Toast.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar el tablero'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchBoards = async () => {
      if (!activeWorkspace) return;

      try {

        const response = await axios.get(`/api/workspaces/${activeWorkspace}/boards`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const boardsData = response.data?.boards || [];
        setBoards(boardsData);
        setRecentBoards(boardsData.filter(b => b.title).slice(-5).reverse());

      } catch (error) {
        console.error('Error fetching boards:', error);
        Toast.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar el tablero'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [activeWorkspace]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const starredBoards = boards.filter(board => board.favorite);

  return (
    <>
      <WorkspaceNavbar
        boards={boards}
        recentBoards={recentBoards}
        starredBoards={starredBoards}
        ownerName={user?.name}
        onBoardSelect={handleBoardSelect}
      />

      <Container fluid className="pt-3">
        <Row>
          <Col md={12} className="p-3">
            <BoardOverview
            
              boards={boards}
              recentBoards={recentBoards}
              starredBoards={starredBoards}
              onCreateNewBoard={handleCreateNewBoard}
              onDeleteBoard={handleDeleteBoard}
              showModal={showModal}
              openModal={openModal}
              closeModal={closeModal}
              newBoardTitle={newBoardTitle}
              setNewBoardTitle={setNewBoardTitle}
              newBoardDescription={newBoardDescription}
              setNewBoardDescription={setNewBoardDescription}
              newBoardImage={newBoardImage}
              setNewBoardImage={setNewBoardImage}
              newBoardColor={newBoardColor}
              setNewBoardColor={setNewBoardColor}
              onEditBoard={openEditModal}
              editModalOpen={editModalOpen}
              closeEditModal={closeEditModal}
              editBoardTitle={editBoardTitle}
              setEditBoardTitle={setEditBoardTitle}
              editBoardDescription={editBoardDescription}
              setEditBoardDescription={setEditBoardDescription}
              handleEditBoard={handleEditBoard}
              editBoardImage={editBoardImage}
              setEditBoardImage={setEditBoardImage}
              editBoardColor={editBoardColor}
              setEditBoardColor={setEditBoardColor}
              onToggleFavorite={handleToggleFavorite}
              resizeImage={resizeImage}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;

