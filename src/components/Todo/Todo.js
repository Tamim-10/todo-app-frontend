import React from 'react';

import Button from '../Button/Button';
import './Todo.css';

const todo = props => (
  <article className="todo">
    <header className="todo__header">
      <h3 className="todo__meta">
        Added on {props.date}
      </h3>
      <h1 className="todo__title">{props.text}</h1> 
    </header>
    <div className="todo__actions">
      <Button mode="flat" onClick={props.onStartEdit}>
        Edit
      </Button>
      <Button mode="flat" design="danger" onClick={props.onDelete}>
        Delete
      </Button>
    </div>
  </article>
);

export default todo;
