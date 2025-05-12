import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "@/utils/Actions";
import { Box } from "@chakra-ui/react";

const getModeByLanguage = (language) => {
  switch (language) {
    case "javascript":
      return { name: "javascript", json: true };
    case "python":
      return { name: "python" };
    case "c":
      return { name: "text/x-csrc" };
    case "cpp":
      return { name: "text/x-c++src" };
    case "java":
      return { name: "text/x-java" };
    case "typescript":
      return { name: "text/typescript" };
    case "ruby":
      return { name: "ruby" };
    case "go":
      return { name: "go" };
    case "php":
      return { name: "php" };
    default:
      return { name: "javascript", json: true };
  }
};

const Editor = ({
  socketRef,
  roomId,
  onCodeChange,
  language,
  defaultCode,
  onLanguageChange,
}) => {
  const editorRef = useRef(defaultCode);

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: getModeByLanguage(language),
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      //for code syncing
      editorRef.current = editor;

      editor.setSize(null, "100%");

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            language,
            code,
          });
        }
      });
    };

    init();
  }, []);

  // When language changes (update mode)
  useEffect(() => {
    if (editorRef.current && defaultCode) {
      const mode = getModeByLanguage(language);
      editorRef.current.setOption("mode", mode);
      editorRef.current.setValue(defaultCode);
    }
  }, [language, defaultCode]);

  //data received from server
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ language, code }) => {
        onLanguageChange(language);
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <Box height="100%" overflow="hidden">
      <textarea id="realtimeEditor" />
    </Box>
  );
};

export default Editor;
