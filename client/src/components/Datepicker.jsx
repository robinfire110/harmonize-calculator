import React, { useState } from 'react'
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

function Datepicker({ value, onChange, name }) {
    return (
        <div className='p-5'>
            <DateTimePicker onChange={(date) => onChange(name, date)} value={value} />
        </div>
    )
}

export default Datepicker