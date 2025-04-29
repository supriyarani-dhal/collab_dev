export const getFileExtension = (language) => {
    switch (language?.toLowerCase()) {
      case "javascript":
        return ".js";
      case "python":
        return ".py";
      case "c":
        return ".c";
      case "c++":
        return ".cpp";
      case "java":
        return ".java";
      case "typescript":
        return ".ts";
      case "ruby":
        return ".rb";
      case "go":
        return ".go";
        case "php":
          return ".php";
          default:
            return ".js";
    }
  };