import React, { Component } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as _ from 'lodash';
import * as d3 from 'd3-scale-chromatic';  // Import D3 for colormap

class NewPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEmbeddings: null,
    };
  }

  // Initialize the plot
  init() {
    const { width, height } = this.mount.getBoundingClientRect();

    this.scene = new THREE.Scene();

    let vFOV = 35;
    let aspect = width / height;
    let near = 0.01;
    let far = 100;

    this.camera = new THREE.PerspectiveCamera(vFOV, aspect, near, far);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x111111, 1);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.addPoints();
    this.setUpCamera();
    this.animate();
  }

  // Function to map labels to colors using the Spectral colormap
  getColorForLabel(label) {
    // D3's Spectral color map ranges from 0 to 1
    const spectralColorMap = d3.interpolateSpectral;
    // Assume labels are between 0 and 9, normalize it to [0, 1]
    const normalizedLabel = label / 9.0;
    const color = new THREE.Color(spectralColorMap(normalizedLabel));
    return color;
  }

  // Add points to the scene
  addPoints() {
    const { selectedEmbeddings } = this.state;
    
    if (!selectedEmbeddings || !selectedEmbeddings.length) {
      console.error('No embeddings found for plotting.');
      return;
    }

    // Create BufferGeometry to store point data
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(selectedEmbeddings.length * 3);  // To store x, y, z
    const colors = new Float32Array(selectedEmbeddings.length * 3);     // To store color data (r, g, b)

    // Iterate over the embeddings and assign x, y, z coordinates and corresponding color
    selectedEmbeddings.forEach((embeddingObj, index) => {
      const embedding = embeddingObj.embedding;
      const label = embeddingObj.label;  // Fetch the label from the selectedEmbeddings array

      // Set positions
      positions[index * 3] = embedding[0];       // x
      positions[index * 3 + 1] = embedding[1];   // y
      positions[index * 3 + 2] = 0;              // z (set to 0 for 2D)

      // Set colors based on the label using Spectral colormap
      const color = this.getColorForLabel(label);
      colors[index * 3] = color.r;   // Red
      colors[index * 3 + 1] = color.g; // Green
      colors[index * 3 + 2] = color.b; // Blue
    });

    // Add positions and colors to the geometry
    pointsGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create PointsMaterial for rendering points
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.5,  // Adjust the size of the points
      vertexColors: true,  // Enable per-vertex coloring
    });

    // Create Points object to add to the scene
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    this.scene.add(points);
  }

  // Set up the camera to fit the data
  setUpCamera() {
    let { width, height } = this.mount.getBoundingClientRect();

    let aspect = this.camera.aspect;
    let vFOV = this.camera.fov;
    let rvFOV = THREE.Math.degToRad(vFOV);

    // Get min and max x, y coordinates for scaling
    let max_x = _.max(this.state.selectedEmbeddings.map(e => e.embedding[0]));
    let min_x = _.min(this.state.selectedEmbeddings.map(e => e.embedding[0]));
    let max_y = _.max(this.state.selectedEmbeddings.map(e => e.embedding[1]));
    let min_y = _.min(this.state.selectedEmbeddings.map(e => e.embedding[1]));

    let max_center = Math.max(Math.abs(min_x), Math.abs(max_x), Math.abs(min_y), Math.abs(max_y));

    // Adjust the camera's z-position based on the scale of the embeddings
    let camera_z_start = max_center / Math.tan(rvFOV / 2);
    this.camera.position.z = camera_z_start * 1.1;
    this.camera.updateProjectionMatrix();
  }

  // Animation loop
  animate = () => {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);
  };

  // Handle window resizing
  handleResize = () => {
    const { width, height } = this.mount.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // Load selected embeddings and labels from localStorage
  componentDidMount() {
    const selectedEmbeddings = JSON.parse(localStorage.getItem('selectedEmbeddings'));

    if (selectedEmbeddings) {
      this.setState({ selectedEmbeddings }, () => {
        this.init();  // Initialize the plot after setting the state
      });
    } else {
      console.error('No selected embeddings found in localStorage');
    }

    // Handle window resizing
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute', 
          top: 0,
          left: 0,
        }}
        ref={mount => (this.mount = mount)}
      >
        {/* This will be the WebGL canvas for the embeddings plot */}
      </div>
    );
  }
}

export default NewPlot;
