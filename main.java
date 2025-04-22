import java.io.*;
class Student implements Serializable{
  private static final long serialVersionUID = 1L;
  String name;
  int age;
  transient String password;
  public Student(String name,int age,String password){
    this.name = name;
    this.password = password;
  }

  public class SerializationExample{
    public static void main(String args[]){
      Student st = new Student("Alice",20,"secret123");
      try(ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("StudentFile.ser"))){
        out.writeObject(st);
        System.out.println("Object serialized successfully");
      }
      catch(IOException e){
        System.out.println("object serialization failed");
      }

      try(ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("StudentFile.ser"))){
        Student ds = (Student) in.readObject();
        System.out.println("\nDeserialized object.");
        ds.display();
      }
      catch(IOException | ClassNotFoundException e){
        e.printStackTree();
      }

    }
  }
}