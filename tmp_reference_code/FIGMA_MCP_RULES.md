# Figma MCP Server Usage Rules for BurnanaPOS

## 📋 Essential Guidelines

### 1. **ALWAYS Use get_code First**
- **Primary Tool**: Use `get_code` to get the initial component structure
- **Parameters Required**:
  - `nodeId`: Extract from Figma URL (e.g., `2001-311` from `node-id=2001-311`)
  - `clientFrameworks`: Always set to `"react"`
  - `clientLanguages`: Always set to `"typescript,javascript"`

### 2. **ALWAYS Follow with get_image**
- **Mandatory**: After `get_code`, immediately call `get_image` with same parameters
- **Purpose**: Visual context to understand the design accurately
- **Critical**: Never skip this step - it prevents misinterpretation

### 3. **Node ID Extraction Rules**
From Figma URLs like: `https://www.figma.com/design/fileKey/fileName?node-id=2001-311&t=token`
- Extract: `2001-311` (replace `-` with `:` if needed: `2001:311`)
- Both formats work: `2001-311` and `2001:311`

## 🔧 Implementation Standards

### 4. **Code Fidelity Requirements**
- **100% Match**: All dimensions, colors, spacing must be pixel-perfect
- **Preserve Data Attributes**: Keep all `data-node-id` and `data-name` attributes
- **Font Specifications**: Use exact font families, weights, and sizes
- **Color Accuracy**: Use exact hex/rgba values from Figma variables

### 5. **Asset Handling**
- **Image Constants**: Generated image URLs are localhost-based for development
- **Production Ready**: Replace with actual assets before deployment
- **SVG/PNG**: Handle both formats consistently
- **Fallbacks**: Provide emoji/text fallbacks for missing assets

### 6. **Styling Approach Priority**
1. **First Choice**: Use Tailwind CSS classes when available
2. **Second Choice**: Inline styles with `style={}` for exact values
3. **Last Resort**: Custom CSS classes only if necessary
4. **Font Loading**: Always import required fonts (Pretendard, etc.)

## 🎯 Figma MCP Workflow Process (6-Step Method)

### 7. **Complete MCP Workflow - MANDATORY SEQUENCE**

**To convert any root_node_id into perfect code, follow these steps in exact order:**

#### Step 1: Analyze Overall Structure
- Call `mcp__figma-dev-mode-mcp-server__get_metadata(root_node_id)` 
- Identify hierarchical structure, size, and position of key frames
- Establish overall layout and component separation strategy
- Map out parent-child relationships

#### Step 2: Fetch Design System
- Call `mcp__figma-dev-mode-mcp-server__get_variable_defs()` 
- Obtain ALL design tokens (colors, fonts, spacing)
- Store variables in internal memory for consistent application
- Prepare variable mapping for code generation

#### Step 3: Check Code Component Mapping
- Call `mcp__figma-dev-mode-mcp-server__get_code_connect_map()`
- Check if design parts link to existing code components
- For linked nodes: import and use mapped components instead of generating
- Identify reusable vs custom components

#### Step 4: Generate and Refine Node by Node
**Bottom-up approach: deepest sub-nodes → parent nodes**
For each node, repeat:
1. **Generate Code Draft**: Call `mcp__figma-dev-mode-mcp-server__get_code(node_id)`
2. **Refine Style**: Replace hard-coded values with design variables
   - `#FFFFFF` → `var(--Basic-White)`
   - `16px` → design token values
3. **Verify Structure**: Compare `get_metadata(node_id)` with generated code
   - Check text content, x/y position, size
   - Convert px → rem/vw for responsiveness
   - Correct any inconsistencies

#### Step 5: Visual Final Verification
- Call `mcp__figma-dev-mode-mcp-server__get_image(node_id)`
- Compare generated code visually with rendered image
- **Tolerance: Maximum 1px error allowed**
- Fine-tune: font rendering, kerning, line height, shadows
- Ensure pixel-perfect match

#### Step 6: Assemble and Finalize
- Combine all node code snippets per Step 1 structure
- Separate into proper file structure:
  - **Component.tsx** (React TypeScript)
  - **styles** (CSS/Tailwind classes)
  - **types** (TypeScript interfaces)
- Add appropriate comments for readability
- Final integration testing

### 8. **Component Structure Rules**
- **File Location**: `src/components/ComponentName.tsx`
- **Export**: Always use `export default function ComponentName()`
- **Props**: Add props only when needed for interactivity
- **Comments**: Minimal comments, let code be self-documenting

### 9. **Responsive Considerations**
- **Primary Target**: Tablet screens (768px - 1024px width)
- **Container**: Use appropriate container sizes from Figma
- **Overflow**: Handle content overflow as designed
- **Touch Targets**: Ensure buttons are touch-friendly

## 🚫 Avoid These Mistakes

### 10. **Common Pitfalls**
- ❌ Don't skip `get_image` - you'll miss visual context
- ❌ Don't modify colors/dimensions - match exactly
- ❌ Don't remove data attributes - they're for debugging
- ❌ Don't use generic classes - use exact values
- ❌ Don't forget font imports - text won't render correctly

### 11. **Asset Management**
- ❌ Don't rely on localhost image URLs in production
- ❌ Don't ignore image alt text and accessibility
- ❌ Don't skip image optimization considerations
- ✅ Plan for asset replacement strategy

## 🔄 Quality Assurance

### 12. **Testing Requirements**
- **Visual Comparison**: Compare rendered output with Figma image
- **Browser DevTools**: Test tablet dimensions (768x1024, 1024x768)
- **Font Loading**: Verify Pretendard fonts load correctly
- **Interactions**: Test hover states, buttons, etc.

### 13. **6-Step Workflow Checklist**
- [ ] **Step 1**: Metadata analyzed and structure mapped
- [ ] **Step 2**: All design variables extracted and documented
- [ ] **Step 3**: Code component mapping checked and applied
- [ ] **Step 4**: Each node generated with variable substitution
- [ ] **Step 5**: Visual verification completed (≤1px tolerance)
- [ ] **Step 6**: Final assembly with proper file separation

### 14. **Code Quality Checklist**
- [ ] Hard-coded values replaced with design variables
- [ ] Responsive units (rem/vw) used where appropriate
- [ ] All data attributes preserved from Figma
- [ ] Visual output matches Figma image exactly
- [ ] Component structure follows project conventions
- [ ] TypeScript interfaces properly defined

## 📚 Reference Examples

### 14. **Good Usage Example**
```typescript
// ✅ Correct implementation
<div 
  className="bg-black box-border content-stretch flex gap-[5px] items-start justify-start overflow-clip px-[100px] py-[140.5px] relative rounded-[18px] size-full min-h-screen" 
  data-name="Welcome" 
  data-node-id="2001:311"
  style={{ fontFamily: 'Pretendard', fontWeight: 800 }}
>
```

### 15. **Variable Usage**
```typescript
// ✅ Use exact values from get_variable_defs
const colors = {
  'Basic / White': '#FFFFFF',
  'BG': '#000000'
};
```

## 🎨 Design System Integration

### 16. **Component Hierarchy**
- **Pages**: Main screens (Welcome, Auth, Dashboard, etc.)
- **Components**: Reusable UI elements (buttons, cards, etc.)
- **Layout**: Structural components (headers, containers, etc.)

### 17. **Future Considerations**
- **Component Library**: Build reusable components from Figma elements
- **Theme System**: Extract colors/fonts into theme configuration
- **Animation System**: Implement micro-interactions as designed
- **Accessibility**: Ensure WCAG compliance alongside visual fidelity

---

## 🔥 Golden Rules

### **Primary Rule: 6-Step Methodology**
**"Always follow the complete 6-step workflow - no shortcuts allowed"**

### **Quality Rule: 1px Tolerance**
**"Maximum 1px visual difference between Figma and browser output"**

### **Consistency Rule: Design Variables**
**"Replace all hard-coded values with design system variables"**

### **Verification Rule: Visual Comparison**
**"Every component must be visually verified against Figma image"**

---

## 🎯 Implementation Priority

1. **Accuracy** > Speed: Perfect implementation over quick delivery
2. **Systematically** > Randomly: Follow 6-step process religiously  
3. **Variables** > Hard-coded: Use design tokens consistently
4. **Responsive** > Fixed: Convert to relative units when appropriate
5. **Verified** > Assumed: Always check with get_image()