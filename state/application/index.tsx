import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { ApplicationState, ApplicationStatus } from './types';

const initialState: ApplicationState = {
  applicationStatus: ApplicationStatus.INITIAL,
};

export const ApplicationSlice = createSlice({
  name: 'Application',
  initialState,
  reducers: {
    setApplicationStatus: (
      state,
      action: PayloadAction<{ appStatus: ApplicationStatus }>
    ) => {
      state.applicationStatus = action.payload.appStatus;
    },
  },
});

export const { setApplicationStatus } = ApplicationSlice.actions;

export default ApplicationSlice.reducer;
