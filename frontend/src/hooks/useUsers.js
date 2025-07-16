// // hooks/useUsers.js
import { useEffect, useState,useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, updateUser, deleteUser } from '../features/userSlice';
import { toast } from 'react-toastify';
export const useUsers = () => {
    const dispatch = useDispatch();
    const usersState = useSelector((state) => state.users);
    const users = usersState.users || [];
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
  
    // Fetch all users - properly memoized with useCallback
    const fetchUsers = useCallback(async () => {
      try {
        setLoading(true);
        await dispatch(getUsers()).unwrap();
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
        toast.error(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }, [dispatch]); // Add dispatch as dependency
  
    // Update a user
  const updateUserHandler = async (userId, userData) => {
    try {
      setLoading(true);
      await dispatch(updateUser({ id: userId, updatedData: userData })).unwrap();
      toast.success('User updated successfully');
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update user');
      toast.error(err.message || 'Failed to update user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUserHandler = async (userId) => {
    try {
      setLoading(true);
      await dispatch(deleteUser(userId)).unwrap();
      toast.success('User deleted successfully');
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      toast.error(err.message || 'Failed to delete user');
      return false;
    } finally {
      setLoading(false);
    }
  };
    // Initial fetch on hook initialization
    useEffect(() => {
      fetchUsers();
    }, [fetchUsers]); // Now this will only run when fetchUsers actually changes
  
    return {
      users,
      loading,
      error,
      editingUser,
      setEditingUser,
      fetchUsers,
      updateUser: updateUserHandler,
      deleteUser: deleteUserHandler,
    };
  };