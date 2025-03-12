"use client";
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Circle,
  Square,
  Type,
  Pencil,
  Hand,
  Trash2,
  Download,
  Upload,
  Image as ImageIcon,
  Undo,
  Redo,
  ChevronDown,
  Move
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function Whiteboard() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState("drawing");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textOptions, setTextOptions] = useState({
    fontSize: 20,
    fontFamily: "Arial",
    color: "#000000",
    bold: false,
    italic: false,
    underline: false,
  });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [shapeType, setShapeType] = useState<string>("rect");
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>("select");
  const [shapeOptions, setShapeOptions] = useState({
    fill: "#ffffff",
    stroke: "#000000",
    strokeWidth: 2,
    opacity: 1,
  });

  // Initialize canvas
  useEffect(() => {
    const canvas = new fabric.Canvas("whiteboard", {
      isDrawingMode: false,
      backgroundColor: backgroundColor,
      selection: true,
      preserveObjectStacking: true,
    });

    // Setup brush
    const brush = new fabric.PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    // Store canvas reference
    canvasRef.current = canvas;

    // Set responsive canvas size
    const resizeCanvas = () => {
      if (canvasContainerRef.current) {
        const width = canvasContainerRef.current.clientWidth;
        const height = Math.max(600, window.innerHeight * 0.6);
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.renderAll();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Save initial state in history
    saveToHistory();

    // Event listeners for object modifications
    canvas.on("object:modified", saveToHistory);
    canvas.on("object:added", saveToHistory);
    canvas.on("object:removed", saveToHistory);

    // Handle shape creation
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [backgroundColor]);

  // Update brush when settings change
  useEffect(() => {
    if (canvasRef.current) {
      if (canvasRef.current.freeDrawingBrush) {
        canvasRef.current.freeDrawingBrush.color = brushColor;
      }
      if (canvasRef.current.freeDrawingBrush) {
        canvasRef.current.freeDrawingBrush.width = brushSize;
      }
    }
  }, [brushColor, brushSize]);

  // Save canvas state to history
  const saveToHistory = () => {
    if (canvasRef.current && !isSaving) {
      setIsSaving(true);

      const json = JSON.stringify(canvasRef.current.toJSON());

      // Remove future history states if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(json);

      // Limit history to prevent memory issues
      const limitedHistory = newHistory.slice(-50);

      setHistory(limitedHistory);
      setHistoryIndex(limitedHistory.length - 1);
      setIsSaving(false);
    }
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0 && canvasRef.current) {
      setIsSaving(true);
      const newIndex = historyIndex - 1;
      const json = history[newIndex];

      canvasRef.current.loadFromJSON(json, () => {
        canvasRef.current?.renderAll();
        setHistoryIndex(newIndex);
        setIsSaving(false);
      });
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1 && canvasRef.current) {
      setIsSaving(true);
      const newIndex = historyIndex + 1;
      const json = history[newIndex];

      canvasRef.current.loadFromJSON(json, () => {
        canvasRef.current?.renderAll();
        setHistoryIndex(newIndex);
        setIsSaving(false);
      });
    }
  };

  // Mouse event handlers for shape creation
  let startPoint: { x: number; y: number } | null = null;
  let currentShape: fabric.Object | null = null;

  const handleMouseDown = (options: fabric.TEvent) => {
    if (!isDrawingShape || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const pointer = canvas.getPointer(options.e);
    startPoint = { x: pointer.x, y: pointer.y };

    // Create initial shape with zero dimensions
    if (shapeType === "rect") {
      currentShape = new fabric.Rect({
        left: startPoint.x,
        top: startPoint.y,
        width: 0,
        height: 0,
        fill: shapeOptions.fill,
        stroke: shapeOptions.stroke,
        strokeWidth: shapeOptions.strokeWidth,
        opacity: shapeOptions.opacity,
        selectable: true,
      });
    } else if (shapeType === "circle") {
      currentShape = new fabric.Circle({
        left: startPoint.x,
        top: startPoint.y,
        radius: 0,
        fill: shapeOptions.fill,
        stroke: shapeOptions.stroke,
        strokeWidth: shapeOptions.strokeWidth,
        opacity: shapeOptions.opacity,
        selectable: true,
      });
    } else if (shapeType === "triangle") {
      currentShape = new fabric.Triangle({
        left: startPoint.x,
        top: startPoint.y,
        width: 0,
        height: 0,
        fill: shapeOptions.fill,
        stroke: shapeOptions.stroke,
        strokeWidth: shapeOptions.strokeWidth,
        opacity: shapeOptions.opacity,
        selectable: true,
      });
    } else if (shapeType === "line") {
      currentShape = new fabric.Line(
        [startPoint.x, startPoint.y, startPoint.x, startPoint.y],
        {
          stroke: shapeOptions.stroke,
          strokeWidth: shapeOptions.strokeWidth,
          selectable: true,
        }
      );
    }

    if (currentShape) {
      canvas.add(currentShape);
      canvas.renderAll();
    }
  };

  const handleMouseMove = (options: fabric.TEvent) => {
    if (!isDrawingShape || !startPoint || !currentShape || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const pointer = canvas.getPointer(options.e);

    if (shapeType === "rect") {
      const rect = currentShape as fabric.Rect;
      const width = Math.abs(pointer.x - startPoint.x);
      const height = Math.abs(pointer.y - startPoint.y);

      rect.set({
        left: Math.min(startPoint.x, pointer.x),
        top: Math.min(startPoint.y, pointer.y),
        width: width,
        height: height,
      });
    } else if (shapeType === "circle") {
      const circle = currentShape as fabric.Circle;
      const radius = Math.sqrt(
        Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2)
      ) / 2;
      const centerX = (startPoint.x + pointer.x) / 2;
      const centerY = (startPoint.y + pointer.y) / 2;

      circle.set({
        left: centerX - radius,
        top: centerY - radius,
        radius: radius,
      });
    } else if (shapeType === "triangle") {
      const triangle = currentShape as fabric.Triangle;
      const width = Math.abs(pointer.x - startPoint.x);
      const height = Math.abs(pointer.y - startPoint.y);

      triangle.set({
        left: Math.min(startPoint.x, pointer.x),
        top: Math.min(startPoint.y, pointer.y),
        width: width,
        height: height,
      });
    } else if (shapeType === "line") {
      const line = currentShape as fabric.Line;
      line.set({
        x2: pointer.x,
        y2: pointer.y,
      });
    }

    canvas.renderAll();
  };

  const handleMouseUp = () => {
    if (!isDrawingShape || !canvasRef.current) return;

    startPoint = null;
    currentShape = null;
    saveToHistory();
  };

  // Switch to drawing mode
  const enableDrawingMode = () => {
    if (canvasRef.current) {
      canvasRef.current.isDrawingMode = true;
      setCurrentMode("draw");
    }
  };

  // Switch to selection mode
  const enableSelectionMode = () => {
    if (canvasRef.current) {
      canvasRef.current.isDrawingMode = false;
      setIsDrawingShape(false);
      setCurrentMode("select");
    }
  };

  // Set shape drawing mode
  const enableShapeMode = (shape: string) => {
    if (canvasRef.current) {
      canvasRef.current.isDrawingMode = false;
      setShapeType(shape);
      setIsDrawingShape(true);
      setCurrentMode("shape");
    }
  };

  // Add text to canvas
  const addText = () => {
    if (canvasRef.current) {
      const text = new fabric.Textbox("Your text here", {
        left: canvasRef.current.width! / 2 - 100,
        top: canvasRef.current.height! / 2 - 20,
        fontSize: textOptions.fontSize,
        fontFamily: textOptions.fontFamily,
        fill: textOptions.color,
        fontWeight: textOptions.bold ? "bold" : "normal",
        fontStyle: textOptions.italic ? "italic" : "normal",
        underline: textOptions.underline,
        width: 200,
        editable: true,
        borderColor: "#1E88E5",
        editingBorderColor: "#1E88E5",
        cornerColor: "#1E88E5",
        cornerSize: 8,
      });

      canvasRef.current.add(text);
      canvasRef.current.setActiveObject(text);
      canvasRef.current.renderAll();
      saveToHistory();
      enableSelectionMode();
    }
  };

  // Clear the board
  const clearBoard = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      canvasRef.current.backgroundColor = backgroundColor;
      canvasRef.current.renderAll();
      saveToHistory();
    }
  };

  // Delete selected object
  const deleteSelectedObject = () => {
    if (canvasRef.current) {
      const activeObjects = canvasRef.current.getActiveObjects();
      if (activeObjects.length > 0) {
        activeObjects.forEach(obj => {
          canvasRef.current!.remove(obj);
        });
        canvasRef.current.discardActiveObject();
        canvasRef.current.renderAll();
        saveToHistory();
      }
    }
  };

  // Export canvas as image
  const exportCanvas = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2, // Higher resolution
      });

      const link = document.createElement("a");
      link.download = "whiteboard-" + new Date().toISOString().slice(0, 10) + ".png";
      link.href = dataURL;
      link.click();
    }
  };

  // Import image
  const handleImportImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && canvasRef.current) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const imgObj = new Image();
        imgObj.src = event.target?.result as string;
        imgObj.onload = () => {
          const image = new fabric.Image(imgObj);

          // Scale down if image is too big
          if (image.width! > canvasRef.current!.width! || image.height! > canvasRef.current!.height!) {
            const scale = Math.min(
              canvasRef.current!.width! / image.width!,
              canvasRef.current!.height! / image.height!
            ) * 0.7; // Leave some margin

            image.scale(scale);
          }

          // Center the image
          image.left = (canvasRef.current!.width! - image.width! * (image.scaleX || 1)) / 2;
          image.top = (canvasRef.current!.height! - image.height! * (image.scaleY || 1)) / 2;

          canvasRef.current!.add(image);
          canvasRef.current!.setActiveObject(image);
          canvasRef.current!.renderAll();
          saveToHistory();
          enableSelectionMode();
        };
      };

      reader.readAsDataURL(file);
      e.target.value = ""; // Reset file input
    }
  };

  // Import image trigger
  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Update active text properties
  const updateActiveText = () => {
    if (canvasRef.current) {
      const activeObj = canvasRef.current.getActiveObject();
      if (activeObj && activeObj.type === "textbox") {
        const textObj = activeObj as fabric.Textbox;
        textObj.set({
          fontSize: textOptions.fontSize,
          fontFamily: textOptions.fontFamily,
          fill: textOptions.color,
          fontWeight: textOptions.bold ? "bold" : "normal",
          fontStyle: textOptions.italic ? "italic" : "normal",
          underline: textOptions.underline,
        });
        canvasRef.current.renderAll();
        saveToHistory();
      }
    }
  };
  return (
    <div className="w-full flex flex-col">
      {/* Main Canvas Area */}
      <div
        ref={canvasContainerRef}
        className="flex-grow bg-neutral-50 border-1"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        <canvas id="whiteboard" className="w-full h-full" />
      </div>

      {/* Bottom Control Panel */}
      <CardContent className="border-t p-2 flex flex-col gap-2">
        {/* Top Row - Main Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={enableSelectionMode}
              variant={currentMode === "select" ? "default" : "outline"}
              size="sm"
              title="Select"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              onClick={enableDrawingMode}
              variant={currentMode === "draw" ? "default" : "outline"}
              size="sm"
              title="Draw"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Shapes dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={currentMode === "shape" ? "default" : "outline"}
                  size="sm"
                  title="Shapes"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => enableShapeMode("rect")}>
                  <Square className="h-4 w-4 mr-2" /> Rectangle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => enableShapeMode("circle")}>
                  <Circle className="h-4 w-4 mr-2" /> Circle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => enableShapeMode("triangle")}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3L22 20H2L12 3Z" />
                  </svg>
                  Triangle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => enableShapeMode("line")}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 19L19 5" />
                  </svg>
                  Line
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={addText}
              variant="outline"
              size="sm"
              title="Add Text"
            >
              <Type className="h-4 w-4" />
            </Button>

            <Button
              onClick={triggerImageUpload}
              variant="outline"
              size="sm"
              title="Upload Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportImage}
              className="hidden"
              accept="image/*"
            />

            <Button
              onClick={deleteSelectedObject}
              variant="outline"
              size="sm"
              title="Delete Selected"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium hidden md:block">Collaborative Whiteboard</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleUndo}
                size="sm"
                variant="outline"
                disabled={historyIndex <= 0}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleRedo}
                size="sm"
                variant="outline"
                disabled={historyIndex >= history.length - 1}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                onClick={exportCanvas}
                size="sm"
                variant="outline"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                onClick={clearBoard}
                size="sm"
                variant="destructive"
                title="Clear Board"
              >
                Clear Board
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Property Panel */}
        <div className="border-t pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full md:w-1/3">
              <TabsTrigger value="drawing">Draw</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="shape">Shape</TabsTrigger>
            </TabsList>

            <TabsContent value="drawing" className="p-2 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Brush Size: {brushSize}px
                  </label>
                  <Slider
                    value={[brushSize]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={(value) => setBrushSize(value[0])}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Brush Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: brushColor }} />
                    <Input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-10 h-8"
                    />
                    <Input
                      type="text"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-20 h-8"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text" className="p-2 mt-2">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Font Size
                  </label>
                  <Slider
                    value={[textOptions.fontSize]}
                    min={8}
                    max={72}
                    step={1}
                    onValueChange={(value) => {
                      setTextOptions({ ...textOptions, fontSize: value[0] });
                      updateActiveText();
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Font Family
                  </label>
                  <select
                    value={textOptions.fontFamily}
                    onChange={(e) => {
                      setTextOptions({ ...textOptions, fontFamily: e.target.value });
                      updateActiveText();
                    }}
                    className="w-full h-8 border rounded px-2 text-sm"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: textOptions.color }} />
                    <Input
                      type="color"
                      value={textOptions.color}
                      onChange={(e) => {
                        setTextOptions({ ...textOptions, color: e.target.value });
                        updateActiveText();
                      }}
                      className="w-10 h-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Text Style
                  </label>
                  <div className="flex gap-1">
                    <Button
                      variant={textOptions.bold ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextOptions({ ...textOptions, bold: !textOptions.bold });
                        updateActiveText();
                      }}
                      className="font-bold h-8 w-8 p-0"
                    >
                      B
                    </Button>
                    <Button
                      variant={textOptions.italic ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextOptions({ ...textOptions, italic: !textOptions.italic });
                        updateActiveText();
                      }}
                      className="italic h-8 w-8 p-0"
                    >
                      I
                    </Button>
                    <Button
                      variant={textOptions.underline ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextOptions({ ...textOptions, underline: !textOptions.underline });
                        updateActiveText();
                      }}
                      className="underline h-8 w-8 p-0"
                    >
                      U
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shape" className="p-2 mt-2">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Fill Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: shapeOptions.fill }} />
                    <Input
                      type="color"
                      value={shapeOptions.fill}
                      onChange={(e) => setShapeOptions({ ...shapeOptions, fill: e.target.value })}
                      className="w-10 h-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Stroke Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: shapeOptions.stroke }} />
                    <Input
                      type="color"
                      value={shapeOptions.stroke}
                      onChange={(e) => setShapeOptions({ ...shapeOptions, stroke: e.target.value })}
                      className="w-10 h-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Stroke Width
                  </label>
                  <Slider
                    value={[shapeOptions.strokeWidth]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(value) => setShapeOptions({ ...shapeOptions, strokeWidth: value[0] })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Opacity
                  </label>
                  <Slider
                    value={[shapeOptions.opacity * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setShapeOptions({ ...shapeOptions, opacity: value[0] / 100 })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </div>
  );
}