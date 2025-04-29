// languageSnippets.ts
export const LANGUAGE_SNIPPETS= {
  javascript: `// JavaScript Example
  function greet(name) {
    return "Hello, " + name + "!";
  }
  console.log(greet("World"));`,
  
    python: `# Python Example
  def greet(name):
      return "Hello, " + name + "!"
  print(greet("World"))`,
  
    c: `// C Example
  #include <stdio.h>
  
  int main() {
      printf("Hello, World!\\n");
      return 0;
  }`,
  
    cpp: `// C++ Example
  #include <iostream>
  using namespace std;
  
  int main() {
      cout << "Hello, World!" << endl;
      return 0;
  }`,
  
    java: `// Java Example
  public class Main {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }`,
  
    typescript: `// TypeScript Example
  function greet(name: string): string {
    return "Hello, " + name + "!";
  }
  console.log(greet("World"));`,
  
    ruby: `# Ruby Example
  def greet(name)
    "Hello, #{name}!"
  end
  puts greet("World")`,
  
    go: `// Go Example
  package main
  import "fmt"
  
  func main() {
      fmt.Println("Hello, World!")
  }`,
  
    php: `<?php
  // PHP Example
  function greet($name) {
    return "Hello, " . $name . "!";
  }
  echo greet("World");
  ?>`,
  };
  
  