// src/features/event/eventSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// --- Types ---
interface MainData {
    logo: File | null;
    approvalRequired: boolean;
    name: string;
    description: string;
    dateFrom: string | null;
    dateTo: string | null;
    location: string;
    guestTypes: string[];
}

interface Registration {
    selectedForm: number | null;
    visibleFields: string[];
    showEventLogo: boolean;
    showConfirmationMessage: boolean;
    useQRCode: boolean;
    showLocation: boolean;
    showEventDetails: boolean;
}
interface Badges {

    selectedBadges: string[];
}

interface EventState {
    eventType: string | null;
    paymentType: string | null;
    mainData: MainData;
    registration: Registration;
    badges: Badges
}

// Payload for registration form
interface RegistrationFormPayload {
    id: number;
    defaultFields: string[];
}


// --- Initial State ---
const initialState: EventState = {
    eventType: null,
    paymentType: null,
    mainData: {
        logo: null,
        approvalRequired: false,
        name: '',
        description: '',
        dateFrom: null,
        dateTo: null,
        location: '',
        guestTypes: [],
    },
    registration: {
        selectedForm: null,
        visibleFields: [],
        showEventLogo: true,
        showConfirmationMessage: false,
        useQRCode: false,
        showLocation: false,
        showEventDetails: false,
    },
    badges: {

        selectedBadges: [],
    }
};

// --- Slice ---
const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        setEventType: (state, action: PayloadAction<string | null>) => {
            state.eventType = action.payload;
        },
        setPaymentType: (state, action: PayloadAction<string | null>) => {
            state.paymentType = action.payload;
        },
        updateMainData: (state, action: PayloadAction<Partial<MainData>>) => {
            state.mainData = { ...state.mainData, ...action.payload };
        },
        setRegistrationForm: (state, action: PayloadAction<RegistrationFormPayload>) => {
            state.registration.selectedForm = action.payload.id;
            state.registration.visibleFields = action.payload.defaultFields;
        },
        updateRegistrationOptions: (state, action: PayloadAction<Partial<Registration>>) => {
            state.registration = { ...state.registration, ...action.payload };
        },
        resetEvent: () => initialState,
    },
});

export const {
    setEventType,
    setPaymentType,
    updateMainData,
    setRegistrationForm,
    updateRegistrationOptions,
    resetEvent,
} = eventSlice.actions;

export default eventSlice.reducer;
