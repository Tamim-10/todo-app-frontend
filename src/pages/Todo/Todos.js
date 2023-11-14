import React, { Component, Fragment } from 'react';

import Todo from '../../components/Todo/Todo'; 
import Button from '../../components/Button/Button';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Todos.css';

const apiUrl = process.env.REACT_APP_API_URL;
console.log(process.env);

class Todos extends Component {
  state = {
    isEditing: false,
    todos: [],
    totalTodos: 0,
    editTodo: null,
    text: '',
    todoPage: 1,
    todosLoading: true,
    editLoading: false
  };

  componentDidMount() {
    fetch(`${apiUrl}/todo`,{
       headers:{
        Authorization:'Bearer '+ this.props.token
      }
    })  
      .then(res => {
        // console.log(res);
        if (res.status !== 200) {
          throw new Error('Failed to fetch user status.');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData.todos);
        this.setState({ text: resData.todos.text });
      })
      .catch(this.catchError);

    this.loadTodos();
  } 

  loadTodos = direction => {
    // console.log(`directtion ${direction}`);
    if (direction) {
      this.setState({ todosLoading: true, todos: [] });
    }
    let page = this.state.todoPage;
    if (direction === 'next') {
      page++;
      this.setState({ todoPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ todoPage: page });  
    }
    fetch(`${apiUrl}/todo?page=${page}`,{
      headers:{
        Authorization:'Bearer '+ this.props.token
      }
    }) 
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch todos.');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData.totalItems);
        this.setState({
          todos: resData.todos.map(todo=>{
            return {
              ...todo,
              text:todo.text
            }
          }),
          totalTodos: resData.totalItems,
          todosLoading: false
        });
      })
      .catch(this.catchError);
  };

  todoUpdateHandler = event => {
    event.preventDefault();
    console.log(this.state.text);
    let url=`${apiUrl}/todo`;
    let method = 'POST'; 
    if (this.state.editTodo) {
      url = `${apiUrl}/todo/${this.state.editTodo._id}`;
      method = 'PUT';
    }  
    fetch(url,{
        method:method,
        headers:{
          Authorization:'Bearer '+ this.props.token,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          text:this.state.text
        })
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't Add Todo!");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState({ text: '' });
      })
      .catch(this.catchError);
      this.loadTodos();
  };

  editTodoHandler = todoId => {
    this.setState(prevState => {
      const loadedTodo = { ...prevState.todos.find(p => p._id === todoId) };
      console.log(loadedTodo);
      return {
        isEditing: true,
        editTodo: loadedTodo,
        text:loadedTodo.text
      };
    });
  };

  todoInputChangeHandler = (input, value) => {
    this.setState({ text: value }); 
  };

  deleteTodoHandler = todoId => {
    this.setState({ todosLoading: true });
    fetch(`${apiUrl}/todo/${todoId}`,{
      method:'DELETE',
      headers:{
        Authorization:'Bearer '+ this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a todo failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState(prevState => {
          const updatedTodos = prevState.todos.filter(p => p._id !== todoId);
          return { todos: updatedTodos, todosLoading: false };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ todosLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <section className="todos__status">
          <form onSubmit={this.todoUpdateHandler}>
            <Input
              id='text'
              type="text"
              placeholder="Add Todo"
              control="input"
              onChange={this.todoInputChangeHandler}
              value={this.state.text}
            />
            <Button  mode="raised" design="accent" type="submit">
            {this.state.isEditing ? 'Update' : 'Add' }
            </Button>
          </form>
        </section>
        <section className="todos__control">
          {/* <Button mode="raised" design="accent" type="submit">
            Add Todo
          </Button> */}
        </section>
        <section className="todos">
          {this.state.todosLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.todos.length <= 0 && !this.state.todosLoading ? (
            <p style={{ textAlign: 'center' }}>No todos found.</p>
          ) : null}
          {!this.state.todosLoading && (
            <Paginator
              onPrevious={this.loadTodos.bind(this, 'previous')}
              onNext={this.loadTodos.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalTodos / 2)}
              currentPage={this.state.todoPage}
            > 
              {this.state.todos.map(todo => (
                <Todo
                  key={todo._id}
                  id={todo._id}
                  author={todo.creator.name}
                  date={new Date(todo.createdAt).toLocaleDateString('en-US')}
                  text={todo.text} 
                  onStartEdit={this.editTodoHandler.bind(this, todo._id)}
                  onDelete={this.deleteTodoHandler.bind(this, todo._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}
   
export default Todos;
