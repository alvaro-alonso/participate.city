import React from "react";

export default function editableEntry (props) {
  return <>
    <li key={props.element} id={props.element} class="list-group-item  justify-content-between align-items-center marg_left">
      <span class="left"> { props.element } </span>
      <button class="fa fa-trash-o right inline" id="erase" onClick={props.delete}></button>
    </li>
  </>;
}