import { Component, OnInit } from '@angular/core';
import { DestinosService, MisViajes, ViajesPosibles } from 'src/app/servicios/destinos.service';
import { ToastController } from '@ionic/angular';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { airplane, camera, trash, searchCircle, addCircle } from 'ionicons/icons'
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  styleUrls: ['./viajes.component.scss'],
  standalone: true,
  imports: [ IonicModule, CommonModule, FormsModule, NgFor, RouterModule]
})
export class ViajesComponent  implements OnInit {

  viajesPosibles: ViajesPosibles[] = []
  misviajes: MisViajes[] = []
  xidSeleccionado: string | undefined = ''    
  modalViajeAbierto: boolean = false;       
  toastMensaje: string = ''                   
  modalinput: any;                            
  busqueda:string = ''

  constructor(
    private servicio: DestinosService,
    private toastController: ToastController
  ) { addIcons({ airplane, camera, trash, searchCircle, addCircle }) }

  ngOnInit() {
    this.ionViewWillEnter()
  }

  //agregar nuevo destino a la lista (boton +)
  addDestino(xid: string) {
    const destino = this.viajesPosibles.find((x) => x.xid === xid)
    var respuesta = this.servicio.addMisViajes({
      xid: destino?.xid,
      name: destino?.name,
      country: destino?.country,
      imageurl: destino?.imageurl,
      precio: 0
    })
    this.mostrarToast(respuesta.mensaje, respuesta.tipo)
    //this.ionViewWillEnter()
  }

  //modal - (boton avion)
  abrirModalViajes(xid?: string) {
    this.modalViajeAbierto = true
    this.xidSeleccionado = xid
  }

  //cerrar modal
  cancelar() {
    this.modalViajeAbierto = false
  }

  //modificar precio
  confirmar() {
    var respuesta = this.servicio.updateMisViajes(this.modalinput, this.xidSeleccionado)
    this.modalViajeAbierto = false
    this.mostrarToast(respuesta.mensaje, respuesta.tipo)
    //this.ionViewWillEnter()
  }

  //recargar listado cuando se realizan cambios
  async ionViewWillEnter() {
    this.misviajes = this.servicio.getMisViajes()
    this.viajesPosibles = await this.servicio.getRegistro(this.busqueda)
  }

  //eliminar registro de listado
  eliminarDestino(xid?: string) {
    var respuesta = this.servicio.deleteMisViajes(xid)
    this.mostrarToast(respuesta.mensaje, respuesta.tipo)
  }

  //sacar foto (boton camara)
  foto: Photo | null = null
  async sacarFoto(id:string | undefined ) {
    this.foto = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Uri,
      saveToGallery: true,
      correctOrientation: true
    })
    var respuesta = this.servicio.updateFoto(this.foto.webPath, id)
    this.mostrarToast(respuesta.mensaje, respuesta.tipo)
  }  

  // busca en la API 
  async buscarDestino(event:any){
    this.busqueda = event.target.value
    if(event.target.value !== ''){
      this.viajesPosibles = await this.servicio.getRegistro(this.busqueda)
    }
  }
  
  // toast (ventana notificaciones emergente)
  async mostrarToast(mensaje:string, tipo:string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1000,
      position: "bottom",
      color: tipo,
    })
    await toast.present()
  }
}
