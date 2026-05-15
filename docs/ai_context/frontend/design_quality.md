> This file extends common design-quality guidance with web-specific rules.

# Web Design Quality Standards

## Anti-Template Policy

Không ship các UI trông giống template chung chung. Frontend output cần phải có chủ ý (intentional), có quan điểm (opinionated), và đặc thù cho sản phẩm.

### Banned Patterns

- Default card grids với spacing đồng đều và không có phân cấp (hierarchy)
- Stock hero section với headline ở giữa, gradient blob, và CTA chung chung
- Bê nguyên defaults của UI library (MUI, AntD, shadcn) mà không modify
- Flat layouts không có layering, chiều sâu (depth), hay motion
- Uniform radius, spacing, và shadows trên mọi component
- Styling an toàn "gray-on-white" với đúng 1 màu accent trang trí
- Layout "dashboard-by-numbers" (sidebar + cards + charts) không có điểm nhấn
- Default font stacks được dùng mà không có lý do rõ ràng

### Required Qualities

Mọi màn hình frontend ý nghĩa (meaningful) cần thể hiện ít nhất 4 trong các yếu tố sau:

1. **Hierarchy**: Phân cấp rõ ràng thông qua tương phản kích thước (scale contrast)
2. **Rhythm**: Nhịp điệu có chủ ý trong spacing, không dùng padding đồng đều khắp nơi
3. **Depth**: Chiều sâu/layering thông qua overlap, shadows, surfaces, hoặc motion
4. **Typography**: Typography có character và chiến lược pairing thực sự
5. **Color**: Màu sắc dùng theo ngữ nghĩa (semantically), không chỉ để trang trí
6. **Interaction**: Hover, focus, và active states tạo cảm giác được thiết kế kỹ
7. **Composition**: Bố cục phá grid (editorial) hoặc bento grid khi phù hợp
8. **Texture**: Texture, grain, hoặc atmosphere nếu hợp với visual direction
9. **Motion**: Motion làm rõ luồng thao tác thay vì gây xao nhãng
10. **Data Viz**: Data visualization được coi là một phần của design system

## Before Writing Frontend Code

1. Chọn một **specific style direction**. Tránh các defaults mơ hồ như "clean minimal".
2. Define một **palette** có chủ ý.
3. Chọn **typography** một cách cẩn thận.
4. Thu thập ít nhất một tệp nhỏ **real references** (ví dụ thực tế).

## Worthwhile Style Directions

- Editorial / magazine
- Neo-brutalism
- Glassmorphism với real depth
- Dark luxury hoặc light luxury với disciplined contrast
- Bento layouts
- Scrollytelling
- 3D integration
- Swiss / International
- Retro-futurism

**Lưu ý**: Đừng tự động default sang dark mode. Hãy chọn visual direction mà sản phẩm thực sự hướng tới.

## Component Checklist

- [ ] Nó có tránh việc trông giống template Tailwind/shadcn mặc định không?
- [ ] Nó có hover/focus/active states có chủ ý không?
- [ ] Nó có dùng hierarchy thay vì nhấn mạnh đồng đều (uniform emphasis) không?
- [ ] UI này trông có chân thực và tự nhiên khi chụp screenshot trong một sản phẩm thật không?
- [ ] Nếu support cả 2 themes, light mode và dark mode có đều mang lại cảm giác được thiết kế có chủ ý không?
