using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace localmap.Controllers
{
    public class MapController : Controller
    {
        // GET: Map
        public ActionResult Index(string id)
        {
            return View();
        }
    }
}