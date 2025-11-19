import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

// Define the state structure for this slice
interface FormState {
  inputValue: string;
}

// Define the initial state
const initialState: FormState = {
  inputValue: '',
};

// Create the slice
export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    // Reducer to update the input value
    setInputValue: (state, action: PayloadAction<string>) => {
      state.inputValue = action.payload;
    },
    // Reducer to clear the input value
    clearInputValue: (state) => {
      state.inputValue = '';
    },
  },
});

// Export the actions
export const { setInputValue, clearInputValue } = formSlice.actions;

// Create a selector to get the input value from the store
export const selectInputValue = (state: RootState) => state.form.inputValue;

// Export the reducer
export default formSlice.reducer;
