import React, { Component } from 'react';

import './SingleTodo.css';

class SingleTodo extends Component {
  state = {
    text: '',
    author: '',
    date: '',
  };

  componentDidMount() {
    const todoId = this.props.match.params.todoId;
    fetch(`http://localhost:8080/todos/${todoId}`,{
      headers:{
        Authorization:'Bearer '+ this.props.token
      }
    })  
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch status');
        }
        return res.json();
      })
      .then(resData => { 
        console.log(resData); 
        this.setState({
          text: resData.todos.text,
          date: new Date(resData.todos.createdAt).toLocaleDateString('en-US'),
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-todo">
        <h1>{this.state.text}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <p>{this.state.text}</p>
      </section>
    );
  }
}

export default SingleTodo;
