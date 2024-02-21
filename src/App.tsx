import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  ReactFlowInstance
} from 'reactflow';
 
import 'reactflow/dist/style.css';
import Sidebar from './Sidebar';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
interface HostNodes {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
}

interface NodesMap {
  [key: string]: HostNodes[];
}

const initialNodes2: NodesMap  = {
  'host1': [
    { id: '3', position: { x: 0, y: 0 }, data: { label: '3' } },
    { id: '4', position: { x: 0, y: 100 }, data: { label: '4' } }
  ],
  'host2': [
    { id: '5', position: { x: 100, y: 0 }, data: { label: '5' } },
    { id: '6', position: { x: 100, y: 100 }, data: { label: '6' } }
  ]
};

const host3= 
  { id: '5', position: { x: 100, y: 0 }, data: { label: '5' } }

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
const initialEdges2 = [{ id: 'e3-4', source: '3', target: '4' }];
 
let id = 0;
const getId = () => `dndnode_${id++}`;
export default function App() {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const reactFlowWrapper = useRef(null);
  const [host, setHost] = useState<keyof NodesMap>('host1');
  const [nodes, setNodes, onNodesChange] = useNodesState(Object.values(initialNodes2[host]));
  const [edges, setEdges, onEdgesChange] = useEdgesState([...initialEdges,...initialEdges2]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params:any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  
  const addNewHost = () => {
    const newHostId = `host${Object.keys(initialNodes2).length + 1}`;
    const newNodes = initialNodes2[Object.keys(initialNodes2)[0]]; // You can use any default host's nodes
    initialNodes2[newHostId] = newNodes;

    // Switch to the newly added host
    switchHost(newHostId);

    const newButton = document.createElement('button');
    newButton.textContent = `Switch to ${newHostId}`;
    newButton.addEventListener('click', () => switchHost(newHostId));

    // Append the new button to the container
    const container = buttonContainerRef.current;
    if (container) {
      container.appendChild(newButton);
    }
  };

  const switchHost = (newHost:string) => {
    setHost(newHost);
    setNodes(initialNodes2[newHost]);
    setEdges(initialEdges2);
  };

  const onDragOver = useCallback((event:any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event:any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      if (reactFlowInstance){
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };
    

      setNodes((nds) => {
        const updatedNodes = [...nds, newNode];
        initialNodes2[host] = updatedNodes;
        return updatedNodes;
      });

    }
    },
    [reactFlowInstance, setNodes, host],
  );



 
  return (
    <div className="dndflow" style={{ width: '100vw', height: '100vh' }}>
     

     
      <ReactFlowProvider>
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
      <div className="button-container" ref={buttonContainerRef}>
        <button onClick={() => switchHost('host1')}>Switch to Host1</button>
        <button onClick={() => switchHost('host2')}>Switch to Host2</button>
        <button onClick={() => addNewHost()}>Add New Host</button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Controls />
        <MiniMap />
        
      </ReactFlow>
      </div>
      <Sidebar />
      </ReactFlowProvider>
    </div>
  );
}