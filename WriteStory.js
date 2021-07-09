import React from 'react';
import { Text, View ,TouchableOpacity , KeyboardAvoidingView , StyleSheet , Image , TextInput } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
// import { styleSheets } from 'min-document';

export default class ReadStoryscreen extends React.Component {
  constructor (){
    super()
    this.state={
      buttonStatus:'normal',
      hasCameraPermission:null,
      scanned:false,
      scannedBookId:'',
      transactionMessage:'',
      scannedStudentId:'',
    }
  }

  getCameraPermissions=async(id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)

    this.setState({
      buttonStatus:id,
      hasCameraPermissions: status ==='granted',
      scanned:false
    })
  }

  handleBarCodeScanned=async({type,data})=>{
    const {buttonState}=this.state

    if(buttonState==='StoryTitle'){
      this.setState({
        scanned:true,
        buttonStatus:'normal',
        scannedBookId:data
      })
    }
    else if(buttonState==='Author'){
      this.setState({
        scanned:true,
        buttonStatus:'normal',
        scannedStudentId:data
      })
    }
  }

  initiateBookIssue=async()=>{
    db.collection("transaction").add({
      "StudentId":this.state.scannedStudentId,
      "BookId":this.state.scannedBookId,
     " transactionType":'issue',
     " data":firebase.fireStore.TimeStamp.now().toDate()
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      "bookAvailability":false
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
      "No.OfBooksIssued":firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedStudentId:'',
      scannedBookId:''
    })
  }

  initiateBookReturn=async()=>{
    db.collection("transaction").add({
      "StudentId":this.state.scannedStudentId,
      "BookId":this.state.scannedBookId,
     " transactionType":'return',
     " data":firebase.fireStore.TimeStamp.now().toDate()
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      "bookAvailability":true
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
      "No.OfBooksIssued":firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedStudentId:'',
      scannedBookId:''
    })
  }

  handleTransaction=async()=>{
    var transactionMessage=null
    db.collection('books').doc(this.state.scannedBookId).get()
    .then((doc)=>{
      var book=doc.data()
      if(book.bookAvailability){
        this.initiateBookIssue()
        transactionMessage="BOOK ISSUED"
        ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }
      else{
        this.initiateBookReturn()
        transactionMessage="BOOK RETURNED SUCCESFULLY"
        ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }
    })
    this.setState({
      transactionMessage:transactionMessage
    })
  }


  render() {
    const hasCameraPermissions=this.state.hasCameraPermissions
    const scanned=this.state.scanned
    const buttonStatus=this.state.buttonStatus

    if(buttonStatus!=='normal' && hasCameraPermissions){
      return(
        <BarCodeScanner
          onBarcodeScanned={scanned?undefined
            :this.handleBarCodeScanned
          }
          style={StyleSheet.absoluteFillObject}
        />
      )
    }
    else if(buttonStatus==='normal'){
      return (
        <KeyboardAvoidingView style={styles.container} behaviour="padding" enabled>
          <View>
            <Text style={{textAlign:'center',fontSize:30}}> STORY HUB </Text>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputField}
              placeholder='StoryTitle'
              value={this.state.scannedBookId}
            />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions('StoryTitle')
              }}
              >
              <Text 
                style={styles.buttonText}
              >
               SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputField}
              placeholder='Author'
              value={this.state.scannedStudentId}
            />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions('Author')
              }}
              >
              <Text 
                style={styles.buttonText}
              >
                SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.Field}
              placeholder='Write Your Story Here'
              value={this.state.scannedStudentId}
            /> 
          </View>
          <TouchableOpacity 
              style={styles.scanedButton}
              onPress={()=>{
                this.getCameraPermissions('Write Your Story Here')
              }}
              >
              <Text 
                style={styles.buttonText}
              >
                SUBMIT
              </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles=StyleSheet.create({
  displayText:{
    fontSize:15,
    textDecorationLine:'underline',
  },
  buttonText:{
    fontSize:15,
  },
  scannedButton:{
    backgroundColor:'blue',
    padding:10,
    margin:10,
  },
  inputField:{
    width:150,
    height:40,
    borderWidth:1.5,
    fontSize:20
  },
   Field:{
    width:215,
    height:200,
    borderWidth:1.5,
    fontSize:20
  },
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    },
  scanButton:{
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5, 
    borderLeftWidth: 0
  },
  scanedButton:{
    backgroundColor: 'lightblue',
    width: 70,
    borderWidth: 1.5, 
  },
  inputView:{
  flexDirection:'row',
  margin:15
  }
})