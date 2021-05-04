// Import React dependencies.
import React, { useMemo, useState, useCallback } from 'react';
// Import the Slate editor factory.
import { createEditor, Transforms, Editor, Text } from 'slate';
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  HighlightOutlined,
  StrikethroughOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const RTE = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          text:
            "Since it's rich text, you can do things like turn a selection of text bold, or add a semantically rendered block quote in the middle of the page, like this:",
        },
      ],
    },
  ]);


  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <>
      {/* Toolbar, composed with Buttons and Icons from Ant design, which is the UI lirbary Floop uses */}
      <Tooltip title="Bold">
        <Button
          icon={<BoldOutlined />}
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        />
      </Tooltip>


      <Tooltip title="Undo">
        <Button
          icon={<UndoOutlined />}
          onMouseDown={(event) => {
            event.preventDefault();

          }}
        />
      </Tooltip>
      <Tooltip title="Redo">
        <Button
          icon={<RedoOutlined />}
          onMouseDown={(event) => {
            event.preventDefault();
            editor.history = {
              redos: []
            }
            //CustomEditor.toggleUnderlineMark(editor);
          }}
        />
      </Tooltip>


      <Tooltip title="Italicize">
        <Button
          danger={CustomEditor.isItalicMarkActive(editor)}
          icon={<ItalicOutlined />}
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleItalicMark(editor);
          }}
        />
      </Tooltip>
      <Tooltip title="Underline">
        <Button
          icon={<UnderlineOutlined />}
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleUnderlineMark(editor);
          }}
        />
      </Tooltip>
      <Tooltip title="Highlight">
        <Button
          icon={<HighlightOutlined />}
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleHighlightMark(editor);
          }}
        />
      </Tooltip>
      <Tooltip title="Strike through">
        <Button
          icon={<StrikethroughOutlined />}
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleStrikethroughMark(editor);
          }}
        />
      </Tooltip>

      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (!event.ctrlKey) {
              return;
            }

            // eslint-disable-next-line default-case
            switch (event.key) {
              // When "`" is pressed, keep our existing code block logic.
              case '`': {
                event.preventDefault();
                CustomEditor.toggleCodeBlock(editor);
                break;
              }

              // When "B" is pressed, bold the text in the selection.
              case 'b': {
                event.preventDefault();
                CustomEditor.toggleBoldMark(editor);
                break;
              }
            }
          }}
        />
      </Slate>
    </>
  );
};

// Element = HTML block elements
const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};
const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

// Leaf = HTML inline elements
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    attributes = { ...attributes, style: { textDecoration: 'underline' } };
  }

  if (leaf.highlight) {
    children = <mark>{children}</mark>;
  }

  if (leaf.strikethrough) {
    attributes = { ...attributes, style: { textDecoration: 'line-through' } };
  }

  return <span {...attributes}>{children}</span>;
};

// CustomEditor is a namespace that extracts the logic out of the editor so it can be re-used by the Toolbar AND keyboard shortcuts
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isItalicMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.italic === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === 'code',
    });

    return !!match;
  },

  isUnderlineActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.underline === true,
      universal: true,
    });

    return !!match;
  },

  isHighlightActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.highlight === true,
      universal: true,
    });

    return !!match;
  },

  isStrikethroughActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.strikethrough === true,
      universal: true,
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },

  toggleItalicMark(editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    Transforms.setNodes(
      editor,
      { italic: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },

  toggleUnderlineMark(editor) {
    const isActive = CustomEditor.isUnderlineActive(editor);
    Transforms.setNodes(
      editor,
      { underline: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },

  toggleHighlightMark(editor) {
    const isActive = CustomEditor.isHighlightActive(editor);
    Transforms.setNodes(
      editor,
      { highlight: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },

  // toggleUndo(editor) {
  //   Transforms.setNodes(
  //     editor,
  //     { type: 'undo', highlight: isActive ? null : true },
  //   )
  // },

  toggleStrikethroughMark(editor) {
    const isActive = CustomEditor.isStrikethroughActive(editor);
    Transforms.setNodes(
      editor,
      { strikethrough: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },
};

export default RTE;
