import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import applicationReducer from './application';
import swapReducer from './swap';

const store = configureStore({
  reducer: {
    application: applicationReducer,
    swap: swapReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
