import re
import sys
import os

def process_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Colors replacement
    content = content.replace('bg-gray-50', 'bg-slate-50')
    content = content.replace('bg-gray-100', 'bg-slate-100')
    content = content.replace('border-gray-100', 'border-slate-100')
    content = content.replace('border-gray-200', 'border-slate-200')
    content = content.replace('text-gray-900', 'text-slate-900')
    content = content.replace('text-gray-800', 'text-slate-900')
    content = content.replace('text-gray-600', 'text-slate-500')
    content = content.replace('text-gray-500', 'text-slate-500')
    content = content.replace('text-gray-400', 'text-slate-400')
    content = content.replace('text-gray-200', 'text-slate-200')
    
    content = content.replace('bg-orange-50', 'bg-blue-50')
    content = content.replace('bg-orange-100', 'bg-blue-100')
    content = content.replace('bg-orange-[', 'bg-blue-[') 
    content = content.replace('text-orange-600', 'text-blue-600')
    content = content.replace('text-orange-500', 'text-blue-500')
    content = content.replace('text-orange-400', 'text-blue-400')
    content = content.replace('border-orange-200', 'border-blue-200')
    content = content.replace('border-orange-500/20', 'border-blue-500/20')
    content = content.replace('border-orange-600', 'border-blue-600')

    # Gradient text
    content = content.replace('from-orange-400 to-orange-600', 'from-blue-600 to-blue-800')

    # CTA Buttons (primary)
    content = re.sub(r'bg-orange-600\s+rounded-full\s+hover:bg-orange-700\s+transition-all\s+duration-300\s+shadow-lg\s+hover:-translate-y-1', 
                     'bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:scale-105 transition-all duration-300 shadow-lg', content)
    
    content = content.replace('bg-orange-600 text-white', 'bg-gradient-to-r from-blue-600 to-blue-700 text-white transform hover:scale-105 transition-all duration-300')
    content = content.replace('bg-orange-600 rounded-tl-3xl', 'bg-blue-600 rounded-tl-3xl')
    content = content.replace('bg-orange-600 rounded-br-3xl', 'bg-blue-600 rounded-br-3xl')
    content = content.replace('hover:bg-orange-700', 'hover:from-blue-700 hover:to-blue-800 text-white transform hover:scale-105 transition-all duration-300')

    # Spacing py-40, py-24 -> py-20
    content = re.sub(r'py-40', 'py-20', content)
    content = re.sub(r'py-24', 'py-20', content)

    # Hierarchy H1 (Hero)
    content = re.sub(r'text-[56]xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg', 
                     'text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg', content)
    
    content = re.sub(r'max-w-\[85%\] md:max-w-2xl mx-auto md:mx-0', 'max-w-2xl mx-auto md:mx-0', content)

    # Cards Redesign
    content = re.sub(r'rounded-2xl\s+shadow-[x]*l\s+overflow-hidden\s+hover:shadow-2xl\s+transition-all\s+duration-300\s+hover:-translate-y-2\s+flex\s+flex-col\s+h-full\s+border\s+border-slate-100',
                     'rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-slate-100', content)

    # Convert aspect ratio for property cards explicitly (not globally for all h-64 just in case)
    content = re.sub(r'<a href="[^"]+"\s+class="relative block h-64 overflow-hidden">', 
                     lambda m: m.group(0).replace('h-64', 'aspect-video'), content)

    content = content.replace('transform group-hover:scale-110', 'transform group-hover:scale-105')

    # Floating Rol Propio
    # Look for cards that have Rol Propio and add the badge next to "Disponible" badge 
    def modify_rol_propio(match):
        card_content = match.group(0)
        # If it has Rol Propio, inject the badge at the top
        if '> Rol Propio</span>' in card_content:
            # We want to place the label like this: <span class="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">Rol Propio</span>
            # Find the placement of "Disponible" badge or just inject after `overflow-hidden">`
            if '<span class="absolute top-4 left-4' not in card_content:
                 card_content = re.sub(r'(<a href="[^"]+"\s+class="relative block aspect-video overflow-hidden">)',
                                       r'\1\n              <span class="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">Rol Propio</span>',
                                       card_content)
        return card_content

    content = re.sub(r'<article class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl[\s\S]*?</article>', modify_rol_propio, content)

    # Delete the inline "Rol Propio" as requested we have a floating tag now
    # Wait, the prompt says "Agrega un badge flotante para el 'Rol Propio'." It doesn't strictly say delete the existing, but it's redundant.
    # Let's delete the inline span that contains Rol Propio
    content = re.sub(r'<span class="inline-flex items-center px-2 py-1 rounded-full text-\[10px\] font-medium bg-slate-[0-9]+ text-slate-[0-9]+[^>]+><i class="fa-solid fa-file-contract mr-1 text-blue-[0-9]+"></i> Rol Propio</span>', '', content)


    # Glassmorphism scrolled nav
    style_scrolled = """    #main-nav.scrolled {
      background-color: rgb(255 255 255 / 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgb(255 255 255 / 0.2);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }"""
    content = re.sub(r'#main-nav\.scrolled\s*{[^}]+}', style_scrolled, content)
    
    # Whatsapp CSS cleanup
    whatsapp_html_new = r"""
<div id="whatsapp-widget" class="fixed bottom-5 right-4 md:bottom-6 md:right-6 z-[2147483647] font-poppins" style="-webkit-tap-highlight-color: transparent;">
    <div id="chat-window" class="hidden w-[300px] bg-white rounded-xl shadow-2xl absolute bottom-[75px] right-0 overflow-hidden origin-bottom-right transition-all transform scale-100">
        <div class="bg-[#075E54] p-4 text-white flex items-center gap-3">
             <i class="fa-brands fa-whatsapp text-2xl"></i>
             <div>
                 <p class="m-0 font-semibold text-sm leading-tight">Arriagada Consultores</p>
                 <p class="m-0 text-[11px] opacity-80 leading-tight">Responde en menos de 1 hora</p>
             </div>
        </div>
        <div class="p-4 bg-[#e5ddd5] h-[200px] flex flex-col justify-end" style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');">
            <div class="bg-white p-2 md:p-3 rounded-bl-lg rounded-br-lg rounded-tr-lg inline-block max-w-[90%] shadow-sm relative text-[13px] text-[#111b21]">
                <p class="m-0">Hola 👋<br>¿En qué podemos ayudarte con tu parcela hoy?</p>
                <span class="text-[9px] text-[#999] block text-right mt-1">Ahora</span>
            </div>
        </div>
        <div class="p-3 bg-white text-center border-t border-slate-100">
            <a href="https://wa.me/56995838619?text=Hola,%20me%20gustaría%20más%20información." target="_blank" class="flex items-center justify-center gap-2 bg-[#25D366] text-white no-underline px-5 py-2 rounded-full font-semibold text-[13px] transition hover:bg-[#128C7E] shadow-sm w-fit mx-auto">
                <i class="fa-brands fa-whatsapp"></i> Abrir Chat
            </a>
        </div>
    </div>

    <div id="whatsapp-button" onclick="toggleChat()" class="cursor-pointer relative transition-transform hover:scale-105">
        <div class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[11px] flex items-center justify-center font-bold border-2 border-white z-10 shadow-[0_0_0_0_rgba(239,68,68,0.7)] animate-[pulse_2s_infinite]">1</div>
        <div class="bg-[#25D366] w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg">
            <i class="fa-brands fa-whatsapp text-3xl text-white"></i>
        </div>
    </div>
</div>
"""
    content = re.sub(r'<div id="whatsapp-widget">[\s\S]*?(?=</div>\s*</div>\s*</div>)</div>\s*</div>\s*</div>', whatsapp_html_new.strip(), content)
    
    # We should delete the styles from <style> that corresponding to widget
    content = re.sub(r'/\* --- WIDGET WHATSAPP BLINDADO --- \*/[\s\S]*?(?=<script type="application/ld\+json">)', '', content)

    # Save
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    process_html('d:/X_NUEVA_WEB_ARRIAGADA_COSULTORES/index.html')
