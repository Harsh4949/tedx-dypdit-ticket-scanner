import React, { Component } from 'react'

 import axios from 'axios';

export class Demo extends Component {

  markPresent = () => {
    const ticketNumber = 'TX-74MM82';
    const verifiedBy = 'Harshvardhan Patil'; // or whatever value is expected

        axios.put(
        `http://localhost:3000/students/mark-present/${ticketNumber}`,
        { verifiedBy } // send as body
        )
        .then(response => {
            console.log('Marked present:', response.data);
        })
        .catch(error => {
            console.error('Error marking present:', error.response?.data || error.message);
        });
    }

  render() {
    return (
      <div>
       

        <button className='mark-present-button text-2xl caret-amber-50 bg-amber-300 rounded-2xl' onClick={this.markPresent}>Mark Present</button>

      </div>
    )
  }
}

export default Demo

