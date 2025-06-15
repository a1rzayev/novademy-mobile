import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface SubscriptionState {
  subscriptions: Subscription[];
}

const initialState: SubscriptionState = {
  subscriptions: [],
};

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    addSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscriptions.push(action.payload);
    },
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
    clearSubscriptions: (state) => {
      state.subscriptions = [];
    },
  },
});

export const { addSubscription, setSubscriptions, clearSubscriptions } = subscriptionSlice.actions;
export default subscriptionSlice.reducer; 