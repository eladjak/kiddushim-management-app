
/**
 * שירות משתמשים - ייצוא מרוכז
 */
import { getAll, getById, search } from './usersQueries';
import { create, update, deleteUser } from './usersMutations';
import { getProfile, updateProfile, updateRole } from './profilesService';

/**
 * שירות לניהול משתמשים
 */
export const usersService = {
  // שאילתות משתמשים
  getAll,
  getById,
  search,
  
  // מוטציות משתמשים
  create,
  update,
  delete: deleteUser,
  
  // ניהול פרופילים
  getProfile,
  updateProfile,
  updateRole
};

export default usersService;
