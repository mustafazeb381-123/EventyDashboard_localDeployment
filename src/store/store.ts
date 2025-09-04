import { configureStore } from '@reduxjs/toolkit'
import eventReducer from '../RTK/features/event/eventSlice';

export const store = configureStore({
    reducer: {
        event: eventReducer, // add other reducers here if needed

    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;