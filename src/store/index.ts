import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import languageReducer from './slices/languageSlice';
import subscriptionReducer from './slices/subscriptionSlice';

// Import reducers here as we create them
// import courseReducer from './slices/courseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    language: languageReducer,
    subscriptions: subscriptionReducer,
    // Add reducers here as we create them
    // courses: courseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 