import React, { Component } from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Button,
  TouchableOpacity,
} from "react-native";
import Tuner from "./tuner";
import Note from "./note";
import Meter from "./meter";


const instruments = {
  guitar: {
    name: 'Classic Guitar',
    notes: [
    {
      name: 'E',
      octave: 4,
    },
    {
      name: 'B',
      octave: 3,
    },
    {
      name: 'G',
      octave: 3,
    },
    {
      name: 'D',
      octave: 3,
    },
    {
      name: 'A',
      octave: 2,
    },
    {
      name: 'E',
      octave: 2,
    },
  ]
  },
  ukulele: {
    name: 'Ukulele',
    notes: [
    {
      name: 'G',
      octave: 4,
    },
    {
      name: 'C',
      octave: 4,
    },
    {
      name: 'E',
      octave: 4,
    },
    {
      name: 'A',
      octave: 4,
    },
  ],
  },
}

export default class App extends Component {
  state = {
    listening: false,
    tuning: null,

    note: {
      name: "A",
      octave: 4,
      frequency: 440,
    },
  };

  _update(note) {
    this.setState({ note });
  }

  async componentDidMount() {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }

    this.tuner = new Tuner();
    this.tuner.start();
    this.tuner.onNoteDetected = (note) => {
      if (this._lastNoteName === note.name) {
        this._update(note);
      } else {
        this._lastNoteName = note.name;
      }
    };
    this.tuner.onRecogn = (data) => {
      const str = data.value[0].toLowerCase();
      console.log(str);

      if (str.includes('tune')) {
        const instrument =  data.value[0].toLowerCase().split('tune')[1].trim();
        if(instruments[instrument]) {
          this.setState({ tuning: instruments[instrument] });
          console.log('instrument', instrument);
        }
      } else {
        console.log('skip', str);
      }
    }
  }

  render() {
    return (
      <View style={style.body}>
        <StatusBar backgroundColor="#000" translucent />
        {this.state.tuning ? (
        <>
          <Text style={style.tuning}>
            {`Now you are tuning: ${this.state.tuning.name}`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center'}}>
            {this.state.tuning.notes.map(({ name, octave, sharp }) => 
              <Note
                key={name + octave}
                name={[name, sharp ? '#' : '',]} octave={octave}
                style={{ height: 46, width: 20, marginHorizontal: 10,  }}
                octaveStyle={{
                  fontSize: 12,
                  color: (this.state.note.name === name && this.state.note.octave == octave && this.state.note.sharp === sharp) ? "green" : "#c62828",
                }}
                nameStyle={{
                  fontSize: 28,
                  color: (this.state.note.name === name && this.state.note.octave == octave && this.state.note.sharp === sharp) ? "green" : "#c62828",
                }}
              />
            )}

          </View>
        </>
        )
          : null}
        <Meter cents={this.state.note.cents} />
        <Note {...this.state.note} />
        <Text style={style.frequency}>
          {this.state.note.frequency.toFixed(1)} Hz
        </Text>
        <TouchableOpacity
          style={{
            width: '80%',
            padding: 10,
            borderColor: 'red',
            alignItems: 'center',
            borderRadius: 5,
            borderWidth: 1,
            marginTop: 20,
          }}
          onPress={() => {
            this.tuner.startRecognizing();
            this.setState({ listening: true });
            setTimeout(() => {
              this.setState({ listening: false });
              this.tuner.stopRecognizing();
            }, 5000);


          }}
        >
          <Text style={{ fontSize: 20, color: "#37474f" }}>{this.state.listening ? 'Listening...' : 'What we are tuning?'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const style = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'white',
  },
  tuning: {
    textAlign: 'center',
    fontSize: 15,
    color: "#37474f",
    marginBottom: 20,
  },
  frequency: {
    fontSize: 28,
    color: "#37474f",
  },
});
